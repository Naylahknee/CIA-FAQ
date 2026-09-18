import { asc, eq } from "drizzle-orm";
import { requireCommunityUser, takeAuthAttempt, validSameOrigin } from "../../../community-auth";
import { ensureD1AuthSchema } from "../../../community-auth-schema";
import { getDb } from "../../../../db";
import { communityTopics } from "../../../../db/schema";

const cleanTopic = (value: unknown) => String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, "").trim().replace(/\s+/g, " ");

export async function GET() {
  try {
    await requireCommunityUser();
    await ensureD1AuthSchema();
    const topics = await getDb().select({ id: communityTopics.id, name: communityTopics.name })
      .from(communityTopics).where(eq(communityTopics.status, "active")).orderBy(asc(communityTopics.name)).limit(100);
    return Response.json({ topics });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "Topics are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    if (!await validSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
    const user = await requireCommunityUser();
    const limit = await takeAuthAttempt(request, "topic", user.id);
    if (!limit.allowed) return Response.json({ error: "Too many topic requests. Try again later." }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });
    const raw = await request.text();
    if (raw.length > 512) return Response.json({ error: "Request is too large." }, { status: 413 });
    const name = cleanTopic((JSON.parse(raw) as { name?: string }).name);
    if (name.length < 2 || name.length > 50) return Response.json({ error: "Use a topic between 2 and 50 characters." }, { status: 400 });
    await ensureD1AuthSchema();
    const existing = await getDb().select({ id: communityTopics.id }).from(communityTopics).where(eq(communityTopics.name, name)).limit(1);
    if (existing[0]) return Response.json({ topic: { id: existing[0].id, name }, existing: true });
    const topic = { id: crypto.randomUUID(), name, createdBy: user.id, createdAt: new Date() };
    await getDb().insert(communityTopics).values(topic);
    return Response.json({ topic: { id: topic.id, name } }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "The topic could not be created." }, { status: 500 });
  }
}
