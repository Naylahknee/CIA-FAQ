import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { requireCommunityUser } from "../../../../community-auth";
import { getDb } from "../../../../../db";
import { communityPosts } from "../../../../../db/schema";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireCommunityUser();
    const { id } = await context.params;
    const [post] = await getDb().select({ mediaKey: communityPosts.mediaKey, mediaType: communityPosts.mediaType, status: communityPosts.status }).from(communityPosts).where(eq(communityPosts.id, id)).limit(1);
    if (!post?.mediaKey || post.status !== "published") return new Response("Not found", { status: 404 });
    const object = await env.BUCKET.get(post.mediaKey);
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(object.body, { headers: { "content-type": post.mediaType ?? "application/octet-stream", "cache-control": "private, max-age=3600", "x-content-type-options": "nosniff" } });
  } catch (error) { if (error instanceof Response) return error; return new Response("Unavailable", { status: 503 }); }
}
