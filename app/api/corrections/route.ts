import { getDb } from "../../../db";
import { corrections } from "../../../db/schema";
import { validSameOrigin } from "../../community-auth";

export async function POST(request: Request) {
  try {
    if (!await validSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
    const payload = await request.json() as { topic?: string; message?: string; sourceUrl?: string; submitterEmail?: string };
    const topic = payload.topic?.trim() ?? "";
    const message = payload.message?.trim() ?? "";
    if (!topic || !message || topic.length > 120 || message.length > 1200) return Response.json({ error: "Topic and correction details are required." }, { status: 400 });
    await getDb().insert(corrections).values({ id: crypto.randomUUID(), topic: topic.slice(0, 120), message: message.slice(0, 1200), sourceUrl: payload.sourceUrl?.trim().slice(0, 500) || null, submitterEmail: payload.submitterEmail?.trim().slice(0, 200) || null, createdAt: new Date() });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "The correction could not be submitted." }, { status: 500 });
  }
}
