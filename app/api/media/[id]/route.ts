import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { wallSubmissions } from "../../../../db/schema";
import { apiError, getCommunityUser } from "../../../community-auth";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const [row] = await getDb().select().from(wallSubmissions).where(eq(wallSubmissions.id, id)).limit(1);
  const viewer = await getCommunityUser();
  const adminEmail = String(env.ADMIN_EMAIL ?? "").toLowerCase();
  const isOwner = Boolean(viewer && viewer.emailVerified && (viewer.role === "moderator" || viewer.email.toLowerCase() === adminEmail));
  if (!row || (row.status !== "approved" && !isOwner)) return apiError("Not found.", 404);
  const object = await env.BUCKET.get(row.imageKey);
  if (!object) return apiError("Not found.", 404);
  return new Response(object.body, { headers: {
    "content-type": row.imageType,
    "cache-control": row.status === "approved" ? "public, max-age=3600" : "private, no-store",
    "content-disposition": "inline",
    "x-content-type-options": "nosniff"
  } });
}
