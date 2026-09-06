import { and, eq } from "drizzle-orm";
import { requireCommunityUser, validSameOrigin } from "../../../../../community-auth";
import { getDb } from "../../../../../../db";
import { communityReactions } from "../../../../../../db/schema";

const allowed = new Set(["like", "love", "celebrate", "support"]);
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!await validSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
    const user = await requireCommunityUser(); const { id: postId } = await context.params;
    const data = await request.json() as { reaction?: string }; const reaction = String(data.reaction ?? "");
    if (!allowed.has(reaction)) return Response.json({ error: "Choose a valid reaction." }, { status: 400 });
    const existing = await getDb().select().from(communityReactions).where(and(eq(communityReactions.postId, postId), eq(communityReactions.userId, user.id))).limit(1);
    if (existing[0]?.reaction === reaction) await getDb().delete(communityReactions).where(eq(communityReactions.id, existing[0].id));
    else if (existing[0]) await getDb().update(communityReactions).set({ reaction: reaction as "like" | "love" | "celebrate" | "support" }).where(eq(communityReactions.id, existing[0].id));
    else await getDb().insert(communityReactions).values({ id: crypto.randomUUID(), postId, userId: user.id, reaction: reaction as "like" | "love" | "celebrate" | "support", createdAt: new Date() });
    return Response.json({ ok: true });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ error: "Reaction could not be saved." }, { status: 500 }); }
}
