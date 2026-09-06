import { requireCommunityUser, validSameOrigin } from "../../../../../community-auth";
import { getDb } from "../../../../../../db";
import { communityReports } from "../../../../../../db/schema";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!await validSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
    const user = await requireCommunityUser(); const { id: postId } = await context.params;
    const data = await request.json() as { reason?: string }; const reason = String(data.reason ?? "").trim();
    if (!reason || reason.length > 300) return Response.json({ error: "Briefly explain the concern." }, { status: 400 });
    await getDb().insert(communityReports).values({ id: crypto.randomUUID(), postId, userId: user.id, reason, createdAt: new Date() }).onConflictDoNothing();
    return Response.json({ ok: true });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ error: "Report could not be sent." }, { status: 500 }); }
}
