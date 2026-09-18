import { accountRow, checkFactor } from "../../../../account-security";
import { eq } from "drizzle-orm";
import { createSession, noStoreJson, normalizeEmail, resetAuthLimit, takeAuthAttempt, validSameOrigin } from "../../../../community-auth";
import { hashPassword, passwordIterations, verifyPassword } from "../../../../password-security";
import { getDb } from "../../../../../db";
import { communityUsers } from "../../../../../db/schema";
import { mirrorCommunityUser, neonAuthConfigured, neonUserByEmail, updateNeonPassword } from "../../../../neon-auth";
import { ensureD1AuthSchema } from "../../../../community-auth-schema";

const DUMMY_SALT = "00000000000000000000000000000000";

export async function POST(request: Request) {
  try {
    if (!await validSameOrigin(request)) return noStoreJson({ error: "Request could not be verified." }, { status: 403 });
    const data = await request.json() as { email?: string; password?: string; code?: string };
    const email = normalizeEmail(String(data.email ?? ""));
    const password = String(data.password ?? "");
    if (!email || password.length < 1 || password.length > 128) return noStoreJson({ error: "Email or password is incorrect." }, { status: 401 });

    const limit = await takeAuthAttempt(request, "signin", email);
    if (!limit.allowed) return noStoreJson({ error: "Too many sign-in attempts. Wait a few minutes and try again." }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });

    await ensureD1AuthSchema();
    const neonUser = neonAuthConfigured() ? await neonUserByEmail(email) : null;
    const [d1User] = neonAuthConfigured() ? [] : await getDb().select().from(communityUsers).where(eq(communityUsers.email, email)).limit(1);
    const user = neonUser ? {
      id: neonUser.id,
      email: neonUser.email,
      displayName: neonUser.displayName,
      role: neonUser.role,
      emailVerified: neonUser.emailVerified,
      passwordHash: neonUser.passwordHash ?? "",
      passwordSalt: neonUser.passwordSalt ?? "",
      passwordIterations: neonUser.passwordIterations ?? passwordIterations.current,
    } : d1User;
    const verified = user && user.passwordHash && user.passwordSalt
      ? await verifyPassword(password, user.passwordSalt, user.passwordHash, user.passwordIterations)
      : Boolean((await hashPassword(password, DUMMY_SALT)).hash) && false;
    if (!user || !verified) return noStoreJson({ error: "Email or password is incorrect." }, { status: 401 });

    const security = await accountRow(user.id);
    if (!security || !await checkFactor(security, String(data.code ?? ""))) return noStoreJson({ error: "Enter a valid authenticator or recovery code.", requiresTwoFactor: true }, { status: 401 });

    if (user.passwordIterations < passwordIterations.current) {
      const upgraded = await hashPassword(password);
      if (neonAuthConfigured()) await updateNeonPassword(user.id, upgraded.hash, upgraded.salt, upgraded.iterations);
      else await getDb().update(communityUsers).set({ passwordHash: upgraded.hash, passwordSalt: upgraded.salt, passwordIterations: upgraded.iterations }).where(eq(communityUsers.id, user.id));
    }
    if (neonUser) await mirrorCommunityUser(neonUser);
    await resetAuthLimit(limit.key);
    await createSession(user.id);
    return noStoreJson({ ok: true });
  } catch {
    return noStoreJson({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
}
