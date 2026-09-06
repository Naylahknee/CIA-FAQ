import { and, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { requireCommunityUser, validSameOrigin } from "../../../../community-auth";
import { getDb } from "../../../../../db";
import { communityPosts } from "../../../../../db/schema";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!await validSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
    const user = await requireCommunityUser(); const { id } = await context.params;
    const [post] = await getDb().select().from(communityPosts).where(and(eq(communityPosts.id, id), eq(communityPosts.userId, user.id))).limit(1);
    if (!post) return Response.json({ error: "Post not found." }, { status: 404 });
    await getDb().update(communityPosts).set({ status: "removed" }).where(eq(communityPosts.id, id));
    if (post.mediaKey) await env.BUCKET.delete(post.mediaKey);
    return Response.json({ ok: true });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ error: "Post could not be removed." }, { status: 500 }); }
}
