import { requireCommunityUser, takeAuthAttempt, validSameOrigin } from "../../../../../community-auth";
import { getDb } from "../../../../../../db";
import { communityPosts, communityReports } from "../../../../../../db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!await validSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
    const user = await requireCommunityUser(); const { id: postId } = await context.params;
    const limit = await takeAuthAttempt(request, "comment", user.id);
    if (!limit.allowed) return Response.json({ error: "Too many reports in a short period. Try again later." }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });
    const data = await request.json() as { reason?: string }; const reason = String(data.reason ?? "").trim();
    if (!reason || reason.length > 300) return Response.json({ error: "Briefly explain the concern." }, { status: 400 });
    const [post] = await getDb().select({ id: communityPosts.id }).from(communityPosts).where(and(eq(communityPosts.id, postId), eq(communityPosts.status, "published"))).limit(1);
    if (!post) return Response.json({ error: "Post not found." }, { status: 404 });
    await getDb().insert(communityReports).values({ id: crypto.randomUUID(), postId, userId: user.id, reason, createdAt: new Date() }).onConflictDoNothing();
    return Response.json({ ok: true });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ error: "Report could not be sent." }, { status: 500 }); }
}
