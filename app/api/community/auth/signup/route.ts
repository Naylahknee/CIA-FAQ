import { eq } from "drizzle-orm";
import { createSession, hashPassword, noStoreJson, normalizeEmail, takeAuthAttempt, validSameOrigin } from "../../../../community-auth";
import { getDb } from "../../../../../db";
import { communityUsers } from "../../../../../db/schema";

export async function POST(request: Request) {
  try {
    if (!await validSameOrigin(request)) return noStoreJson({ error: "Request could not be verified." }, { status: 403 });
    const data = await request.json() as { displayName?: string; email?: string; password?: string };
    const displayName = String(data.displayName ?? "").replace(/[\u0000-\u001F\u007F]/g, "").trim();
    const email = normalizeEmail(String(data.email ?? ""));
    const password = String(data.password ?? "");
    if (displayName.length < 2 || displayName.length > 60) return noStoreJson({ error: "Enter a display name between 2 and 60 characters." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 200) return noStoreJson({ error: "Enter a valid email address." }, { status: 400 });
    if (password.length < 12 || password.length > 128) return noStoreJson({ error: "Use a password with at least 12 characters." }, { status: 400 });

    const limit = await takeAuthAttempt(request, "signup", email);
    if (!limit.allowed) return noStoreJson({ error: "Too many account-creation attempts. Wait before trying again." }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });

    const existing = await getDb().select({ id: communityUsers.id }).from(communityUsers).where(eq(communityUsers.email, email)).limit(1);
    if (existing.length) return noStoreJson({ error: "Account could not be created. Try signing in or use another email." }, { status: 409 });

    const id = crypto.randomUUID();
    const passwordData = await hashPassword(password);
    await getDb().insert(communityUsers).values({ id, email, displayName, passwordHash: passwordData.hash, passwordSalt: passwordData.salt, passwordIterations: passwordData.iterations, createdAt: new Date() });
    await createSession(id);
    return noStoreJson({ ok: true }, { status: 201 });
  } catch {
    return noStoreJson({ error: "Account creation is temporarily unavailable." }, { status: 503 });
  }
}
