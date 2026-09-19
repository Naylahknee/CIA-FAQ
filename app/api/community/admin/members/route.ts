import { env } from "cloudflare:workers";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { communityUsers } from "../../../../../db/schema";
import { getCommunityUser, noStoreJson, validSameOrigin } from "../../../../community-auth";
import { ensureD1AuthSchema } from "../../../../community-auth-schema";
import { getNeonAuthDb, neonAuthConfigured } from "../../../../neon-auth";

const ROLES = ["member", "moderator", "admin"] as const;
type Role = (typeof ROLES)[number];

type Member = {
  id: string;
  displayName: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string | number | Date;
};

function configuredAdminEmail() {
  return String(env.ADMIN_EMAIL ?? "").trim().toLowerCase();
}

function roleFor(email: string, value: unknown): Role {
  const configured = configuredAdminEmail();
  if (configured && email.toLowerCase() === configured) return "admin";
  return value === "admin" || value === "moderator" ? value : "member";
}

function isAdmin(user: Awaited<ReturnType<typeof getCommunityUser>>) {
  return Boolean(user && (user.role === "admin" || (configuredAdminEmail() && user.email.toLowerCase() === configuredAdminEmail())));
}

function fromNeonRow(row: Record<string, unknown>): Member {
  const email = String(row.email ?? "");
  return {
    id: String(row.id),
    displayName: String(row.displayName ?? ""),
    email,
    role: roleFor(email, row.role),
    emailVerified: Boolean(row.emailVerified),
    createdAt: row.createdAt as string | number | Date,
  };
}

async function listMembers(): Promise<Member[]> {
  if (neonAuthConfigured()) {
    const rows = await getNeonAuthDb().query(`SELECT id, display_name AS "displayName", email, role,
      email_verified_at AS "emailVerified", created_at AS "createdAt"
      FROM auth_users ORDER BY created_at DESC`);
    return rows.map((row) => fromNeonRow(row as Record<string, unknown>));
  }

  await ensureD1AuthSchema();
  const rows = await getDb().select({
    id: communityUsers.id,
    displayName: communityUsers.displayName,
    email: communityUsers.email,
    role: communityUsers.role,
    emailVerified: communityUsers.emailVerified,
    createdAt: communityUsers.createdAt,
  }).from(communityUsers).orderBy(desc(communityUsers.createdAt));

  return rows.map((row) => ({
    ...row,
    role: roleFor(row.email, row.role),
  }));
}

async function mirrorRoleToD1(userId: string, role: Role) {
  try {
    await ensureD1AuthSchema();
    await getDb().update(communityUsers).set({ role }).where(eq(communityUsers.id, userId));
  } catch {
    // Neon is the source of truth when it is configured. A future sign-in will refresh this mirror.
  }
}

async function removeFromD1(userId: string) {
  try {
    await ensureD1AuthSchema();
    await getDb().delete(communityUsers).where(eq(communityUsers.id, userId));
  } catch {
    // The Neon account is already removed; leave cleanup to the next D1 recovery if unavailable.
  }
}

export async function GET() {
  try {
    const user = await getCommunityUser();
    if (!isAdmin(user)) return noStoreJson({ error: "Not authorized." }, { status: 403 });
    const members = await listMembers();
    return noStoreJson({ members, currentUserId: user!.id });
  } catch {
    return noStoreJson({ error: "Member list is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    if (!await validSameOrigin(request)) return noStoreJson({ error: "Request could not be verified." }, { status: 403 });
    const admin = await getCommunityUser();
    if (!isAdmin(admin)) return noStoreJson({ error: "Not authorized." }, { status: 403 });

    const data = await request.json() as { action?: string; userId?: string; role?: string };
    const userId = String(data.userId ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(userId) || userId === admin!.id) {
      return noStoreJson({ error: "That member action is not available." }, { status: 400 });
    }

    if (data.action === "set-role") {
      const role = String(data.role ?? "") as Role;
      if (!ROLES.includes(role)) return noStoreJson({ error: "Choose a valid membership level." }, { status: 400 });

      if (neonAuthConfigured()) {
        const sql = getNeonAuthDb();
        const target = await sql.query("SELECT id FROM auth_users WHERE id = $1 LIMIT 1", [userId]);
        if (!target[0]) return noStoreJson({ error: "That member no longer exists." }, { status: 404 });
        await sql.query("ALTER TABLE auth_users DROP CONSTRAINT IF EXISTS auth_users_role_check");
        await sql.query("ALTER TABLE auth_users ADD CONSTRAINT auth_users_role_check CHECK (role IN ('member', 'moderator', 'admin'))");
        await sql.query("UPDATE auth_users SET role = $1, updated_at = now() WHERE id = $2", [role, userId]);
        await mirrorRoleToD1(userId, role);
      } else {
        await ensureD1AuthSchema();
        await getDb().update(communityUsers).set({ role }).where(eq(communityUsers.id, userId));
      }

      return noStoreJson({ ok: true, role });
    }

    if (data.action === "remove") {
      if (neonAuthConfigured()) {
        const sql = getNeonAuthDb();
        const target = await sql.query("SELECT id FROM auth_users WHERE id = $1 LIMIT 1", [userId]);
        if (!target[0]) return noStoreJson({ error: "That member no longer exists." }, { status: 404 });
        await sql.query("DELETE FROM auth_users WHERE id = $1", [userId]);
        await removeFromD1(userId);
      } else {
        await ensureD1AuthSchema();
        await getDb().delete(communityUsers).where(eq(communityUsers.id, userId));
      }
      return noStoreJson({ ok: true });
    }

    return noStoreJson({ error: "Unknown member action." }, { status: 400 });
  } catch {
    return noStoreJson({ error: "Member action could not be completed." }, { status: 503 });
  }
}
