import { eq } from "drizzle-orm";
import { createSession, normalizeEmail, validSameOrigin, verifyPassword } from "../../../../community-auth";
import { getDb } from "../../../../../db";
import { communityUsers } from "../../../../../db/schema";

export async function POST(request: Request) {
  if (!await validSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
  const data = await request.json() as { email?: string; password?: string };
  const email = normalizeEmail(String(data.email ?? ""));
  const password = String(data.password ?? "");
  const [user] = await getDb().select().from(communityUsers).where(eq(communityUsers.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  await createSession(user.id);
  return Response.json({ ok: true });
}
