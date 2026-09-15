import { eq } from "drizzle-orm";
import { createSession, hashPassword, noStoreJson, normalizeEmail, passwordIterations, resetAuthLimit, takeAuthAttempt, validSameOrigin, verifyPassword } from "../../../../community-auth";
import { getDb } from "../../../../../db";
import { communityUsers } from "../../../../../db/schema";

const DUMMY_SALT = "00000000000000000000000000000000";

export async function POST(request: Request) {
  try {
    if (!await validSameOrigin(request)) return noStoreJson({ error: "Request could not be verified." }, { status: 403 });
    const data = await request.json() as { email?: string; password?: string };
    const email = normalizeEmail(String(data.email ?? ""));
    const password = String(data.password ?? "");
    if (!email || password.length < 1 || password.length > 128) return noStoreJson({ error: "Email or password is incorrect." }, { status: 401 });

    const limit = await takeAuthAttempt(request, "signin", email);
    if (!limit.allowed) return noStoreJson({ error: "Too many sign-in attempts. Wait a few minutes and try again." }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });

    const [user] = await getDb().select().from(communityUsers).where(eq(communityUsers.email, email)).limit(1);
    const verified = user
      ? await verifyPassword(password, user.passwordSalt, user.passwordHash, user.passwordIterations)
      : Boolean((await hashPassword(password, DUMMY_SALT)).hash) && false;
    if (!user || !verified) return noStoreJson({ error: "Email or password is incorrect." }, { status: 401 });

    if (user.passwordIterations < passwordIterations.current) {
      const upgraded = await hashPassword(password);
      await getDb().update(communityUsers).set({ passwordHash: upgraded.hash, passwordSalt: upgraded.salt, passwordIterations: upgraded.iterations }).where(eq(communityUsers.id, user.id));
    }
    await resetAuthLimit(limit.key);
    await createSession(user.id);
    return noStoreJson({ ok: true });
  } catch {
    return noStoreJson({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
}
