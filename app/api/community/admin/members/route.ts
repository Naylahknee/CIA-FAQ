import { env } from "cloudflare:workers";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { communityUsers } from "../../../../../db/schema";
import { getCommunityUser, noStoreJson, validSameOrigin } from "../../../../community-auth";
import { ensureD1AuthSchema } from "../../../../community-auth-schema";
import { getNeonAuthDb, neonAuthConfigured } from "../../../../neon-auth";

const ROLES = ["member", "moderator", "admin"] as const;
type Role = (typeof ROLES)[number];

function isAdmin(user: Awaited<ReturnType<typeof getCommunityUser>>) {
  return Boolean(user && (user.role === "admin" || user.email.toLowerCase() === String(env.ADMIN_EMAIL ?? "").toLowerCase()));
}

export async function GET() {
  try {
    const user = await getCommunityUser();
    if (!isAdmin(user)) return noStoreJson({ error: "Not authorized." }, { status: 403 });
    await ensureD1AuthSchema();
    const members = await getDb().select({ id: communityUsers.id, displayName: communityUsers.displayName, email: communityUsers.email, role: communityUsers.role, emailVerified: communityUsers.emailVerified, createdAt: communityUsers.createdAt }).from(communityUsers).orderBy(desc(communityUsers.createdAt)).limit(250);
    return noStoreJson({ members });
  } catch { return noStoreJson({ error: "Member list is temporarily unavailable." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    if (!await validSameOrigin(request)) return noStoreJson({ error: "Request could not be verified." }, { status: 403 });
    const admin = await getCommunityUser();
    if (!isAdmin(admin)) return noStoreJson({ error: "Not authorized." }, { status: 403 });
    const data = await request.json() as { action?: string; userId?: string; role?: string };
    const userId = String(data.userId ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(userId) || userId === admin!.id) return noStoreJson({ error: "That member action is not available." }, { status: 400 });
    await ensureD1AuthSchema();
    if (data.action === "set-role") {
      const role = String(data.role ?? "") as Role;
      if (!ROLES.includes(role)) return noStoreJson({ error: "Choose a valid membership level." }, { status: 400 });
      await getDb().update(communityUsers).set({ role }).where(eq(communityUsers.id, userId));
      if (neonAuthConfigured()) {
        const sql = getNeonAuthDb();
        await sql.query("ALTER TABLE auth_users DROP CONSTRAINT IF EXISTS auth_users_role_check");
        await sql.query("ALTER TABLE auth_users ADD CONSTRAINT auth_users_role_check CHECK (role IN ('member', 'moderator', 'admin'))");
        await sql.query("UPDATE auth_users SET role=$1, updated_at=now() WHERE id=$2", [role, userId]);
      }
      return noStoreJson({ ok: true });
    }
    if (data.action === "remove") {
      await getDb().delete(communityUsers).where(eq(communityUsers.id, userId));
      if (neonAuthConfigured()) await getNeonAuthDb().query("DELETE FROM auth_users WHERE id=$1", [userId]);
      return noStoreJson({ ok: true });
    }
    return noStoreJson({ error: "Unknown member action." }, { status: 400 });
  } catch { return noStoreJson({ error: "Member action could not be completed." }, { status: 503 }); }
}
