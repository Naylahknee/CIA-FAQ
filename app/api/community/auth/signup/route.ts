import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { createSession, noStoreJson, normalizeEmail, takeAuthAttempt, validSameOrigin } from "../../../../community-auth";
import { hashPassword, passwordError } from "../../../../password-security";
import { accountRow, sendAccountEmail } from "../../../../account-security";
import { getDb } from "../../../../../db";
import { communityUsers } from "../../../../../db/schema";
import { createNeonPasswordUser, mirrorCommunityUser, neonAuthConfigured, neonUserByEmail, neonUserById } from "../../../../neon-auth";
import { ensureD1AuthSchema } from "../../../../community-auth-schema";

export async function POST(request: Request) {
  let stage = "request";
  try {
    if (!await validSameOrigin(request)) return noStoreJson({ error: "Request could not be verified." }, { status: 403 });
    const data = await request.json() as { displayName?: string; email?: string; password?: string };
    const displayName = String(data.displayName ?? "").replace(/[\u0000-\u001F\u007F]/g, "").trim();
    const email = normalizeEmail(String(data.email ?? ""));
    const password = String(data.password ?? "");
    if (displayName.length < 2 || displayName.length > 60) return noStoreJson({ error: "Enter a display name between 2 and 60 characters." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 200) return noStoreJson({ error: "Enter a valid email address." }, { status: 400 });
    const invalidPassword = passwordError(password);
    if (invalidPassword) return noStoreJson({ error: invalidPassword }, { status: 400 });

    stage = "rate-limit";
    const limit = await takeAuthAttempt(request, "signup", email);
    if (!limit.allowed) return noStoreJson({ error: "Too many account-creation attempts. Wait before trying again." }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });

    stage = "id";
    const id = randomUUID();
    stage = "password";
    const passwordData = await hashPassword(password);
    if (neonAuthConfigured()) {
      stage = "lookup";
      if (await neonUserByEmail(email)) return noStoreJson({ error: "Account could not be created. Try signing in or use another email." }, { status: 409 });
      stage = "insert";
      await createNeonPasswordUser({ id, email, displayName, passwordHash: passwordData.hash, passwordSalt: passwordData.salt, passwordIterations: passwordData.iterations });
      const user = await neonUserById(id);
      if (!user) throw new Error("Created account could not be loaded.");
      await mirrorCommunityUser(user, { hash: passwordData.hash, salt: passwordData.salt, iterations: passwordData.iterations });
    } else {
      stage = "schema";
      await ensureD1AuthSchema();
      stage = "lookup";
      const existing = await getDb().select({ id: communityUsers.id }).from(communityUsers).where(eq(communityUsers.email, email)).limit(1);
      if (existing.length) return noStoreJson({ error: "Account could not be created. Try signing in or use another email." }, { status: 409 });
      stage = "insert";
      await getDb().insert(communityUsers).values({ id, email, displayName, passwordHash: passwordData.hash, passwordSalt: passwordData.salt, passwordIterations: passwordData.iterations, createdAt: new Date() });
    }
    stage = "session";
    await createSession(id);
    let verificationEmailSent = false;
    try {
      const user = await accountRow(id);
      if (user) { await sendAccountEmail(user, "verify"); verificationEmailSent = true; }
    } catch {
      // The account remains usable for requesting another verification message.
    }
    return noStoreJson({ ok: true, verificationEmailSent }, { status: 201 });
  } catch (error) {
    console.error("community signup failed", { stage, error });
    const diagnostic = stage === "password" && error instanceof Error
      ? `${error.name}:${error.message}`.replace(/[^A-Za-z0-9 .:_-]/g, "").slice(0, 160)
      : undefined;
    return noStoreJson({ error: "Account creation is temporarily unavailable.", code: `signup_${stage}`, diagnostic }, { status: 503 });
  }
}
