import { eq } from "drizzle-orm";
import { createSession, hashPassword, normalizeEmail, validSameOrigin } from "../../../../community-auth";
import { getDb } from "../../../../../db";
import { communityUsers } from "../../../../../db/schema";

export async function POST(request: Request) {
  if (!await validSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
  const data = await request.json() as { displayName?: string; email?: string; password?: string };
  const displayName = String(data.displayName ?? "").trim();
  const email = normalizeEmail(String(data.email ?? ""));
  const password = String(data.password ?? "");
  if (displayName.length < 2 || displayName.length > 60) return Response.json({ error: "Enter a display name between 2 and 60 characters." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 200) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 10 || password.length > 128) return Response.json({ error: "Use a password with at least 10 characters." }, { status: 400 });
  const existing = await getDb().select({ id: communityUsers.id }).from(communityUsers).where(eq(communityUsers.email, email)).limit(1);
  if (existing.length) return Response.json({ error: "An account already uses that email. Try signing in." }, { status: 409 });
  const id = crypto.randomUUID();
  const passwordData = hashPassword(password);
  await getDb().insert(communityUsers).values({ id, email, displayName, passwordHash: passwordData.hash, passwordSalt: passwordData.salt, createdAt: new Date() });
  await createSession(id);
  return Response.json({ ok: true }, { status: 201 });
}
