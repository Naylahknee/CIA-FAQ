import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { apiError, requireCommunityUser } from "../../../../community-auth";
import { getDb } from "../../../../../db";
import { communityPosts } from "../../../../../db/schema";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireCommunityUser();
    const { id } = await context.params;
    const [post] = await getDb().select({ mediaKey: communityPosts.mediaKey, mediaType: communityPosts.mediaType, status: communityPosts.status }).from(communityPosts).where(eq(communityPosts.id, id)).limit(1);
    if (!post?.mediaKey || post.status !== "published") return apiError("Not found.", 404);
    const object = await env.BUCKET.get(post.mediaKey);
    if (!object) return apiError("Not found.", 404);
    return new Response(object.body, { headers: { "content-type": post.mediaType ?? "application/octet-stream", "cache-control": "no-store", "x-content-type-options": "nosniff", "content-disposition": "inline" } });
  } catch (error) { if (error instanceof Response) return error; return apiError("Media is temporarily unavailable.", 503); }
}
