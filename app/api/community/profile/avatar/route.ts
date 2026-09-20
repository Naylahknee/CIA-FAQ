import { env } from "cloudflare:workers";
import { getCommunityUser, noStoreJson, requireCommunityUser, validSameOrigin } from "../../../../community-auth";
import { ensureD1AuthSchema } from "../../../../community-auth-schema";
import { getNeonAuthDb, neonAuthConfigured } from "../../../../neon-auth";
import { stripImageMetadata } from "../../../../image-security";

const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX = 5 * 1024 * 1024;

export async function GET() {
  try {
    const user = await getCommunityUser();
    if (!user) return new Response(null, { status: 404 });
    await ensureD1AuthSchema();
    const row = await env.DB.prepare("SELECT avatar_key AS avatarKey, avatar_type AS avatarType FROM community_users WHERE id=?").bind(user.id).first<{avatarKey:string|null;avatarType:string|null}>();
    if (!row?.avatarKey) return new Response(null, { status: 404 });
    const object = await env.BUCKET.get(row.avatarKey);
    if (!object) return new Response(null, { status: 404 });
    return new Response(object.body, { headers: { "content-type": row.avatarType || "image/jpeg", "cache-control": "private, max-age=300", "x-content-type-options": "nosniff", "content-disposition": "inline" } });
  } catch { return new Response(null, { status: 404 }); }
}

export async function POST(request: Request) {
  try {
    if (!await validSameOrigin(request)) return noStoreJson({ error: "Invalid request origin." }, { status: 403 });
    const user = await requireCommunityUser();
    const data = await request.formData();
    const avatar = data.get("avatar");
    if (!(avatar instanceof File) || !avatar.size) return noStoreJson({ error: "Choose a profile photo." }, { status: 400 });
    if (!TYPES.has(avatar.type)) return noStoreJson({ error: "Use a JPG, PNG, or WebP image." }, { status: 415 });
    if (avatar.size > MAX) return noStoreJson({ error: "Profile photos must be 5 MB or smaller." }, { status: 413 });
    await ensureD1AuthSchema();
    const old = await env.DB.prepare("SELECT avatar_key AS avatarKey FROM community_users WHERE id=?").bind(user.id).first<{avatarKey:string|null}>();
    const ext = avatar.type === "image/png" ? "png" : avatar.type === "image/webp" ? "webp" : "jpg";
    const key = `community/avatars/${user.id}-${crypto.randomUUID()}.${ext}`;
    await env.BUCKET.put(key, stripImageMetadata(new Uint8Array(await avatar.arrayBuffer()), avatar.type), { httpMetadata: { contentType: avatar.type } });
    await env.DB.prepare("UPDATE community_users SET avatar_key=?, avatar_type=? WHERE id=?").bind(key, avatar.type, user.id).run();
    if (neonAuthConfigured()) await getNeonAuthDb().query("UPDATE auth_users SET avatar_key=$1, avatar_type=$2, updated_at=now() WHERE id=$3", [key, avatar.type, user.id]);
    if (old?.avatarKey && old.avatarKey !== key) await env.BUCKET.delete(old.avatarKey);
    return noStoreJson({ ok: true, avatarUrl: "/api/community/profile/avatar?v=" + Date.now() });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Profile avatar upload failed", error);
    return noStoreJson({ error: "Profile photo could not be saved. Please try again." }, { status: 500 });
  }
}
