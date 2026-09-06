import { eq } from "drizzle-orm";
import { requireCommunityUser, validSameOrigin } from "../../../../../community-auth";
import { getDb } from "../../../../../../db";
import { communityComments, communityPosts } from "../../../../../../db/schema";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!await validSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
    const user = await requireCommunityUser(); const { id: postId } = await context.params;
    const data = await request.json() as { body?: string }; const body = String(data.body ?? "").trim();
    if (!body || body.length > 800) return Response.json({ error: "Comments must be between 1 and 800 characters." }, { status: 400 });
    const [post] = await getDb().select({ id: communityPosts.id }).from(communityPosts).where(eq(communityPosts.id, postId)).limit(1);
    if (!post) return Response.json({ error: "Post not found." }, { status: 404 });
    await getDb().insert(communityComments).values({ id: crypto.randomUUID(), postId, userId: user.id, body, createdAt: new Date() });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ error: "Comment could not be saved." }, { status: 500 }); }
}
