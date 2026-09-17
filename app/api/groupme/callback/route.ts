import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { faqSuggestions } from "../../../../db/schema";
import { analyzeFaqCandidate, redactGroupMeText, secretMatches } from "../../../groupme-faq";

export const runtime = "edge";

type GroupMeCallback = {
  id?: unknown;
  group_id?: unknown;
  name?: unknown;
  text?: unknown;
  system?: unknown;
  sender_type?: unknown;
};

export async function POST(request: Request) {
  const expectedSecret = String(env.GROUPME_WEBHOOK_SECRET ?? "");
  const providedSecret = new URL(request.url).searchParams.get("key") ?? "";
  if (!await secretMatches(providedSecret, expectedSecret)) return new Response("Not found", { status: 404 });
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!contentType.toLowerCase().includes("application/json") || contentLength > 32768) return new Response("Invalid request", { status: 400 });

  let body: GroupMeCallback;
  try {
    const raw = await request.text();
    if (raw.length > 32768) return new Response("Invalid request", { status: 400 });
    body = JSON.parse(raw) as GroupMeCallback;
  } catch {
    return new Response("Invalid request", { status: 400 });
  }

  const messageId = String(body.id ?? "");
  const groupId = String(body.group_id ?? "");
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(messageId) || groupId !== String(env.GROUPME_GROUP_ID ?? "")) return new Response("Not found", { status: 404 });
  if (body.system === true || String(body.sender_type ?? "").toLowerCase() === "bot") return Response.json({ accepted: true });

  const sourceText = redactGroupMeText(body.text, body.name);
  const candidate = analyzeFaqCandidate(sourceText);
  if (!candidate) return Response.json({ accepted: true });

  await getDb().insert(faqSuggestions).values({
    id: crypto.randomUUID(),
    groupmeMessageId: messageId,
    question: candidate.question,
    answer: "",
    category: candidate.category,
    status: candidate.status,
    matchedFaqId: candidate.matchedFaqId,
    sourceText,
    createdAt: new Date(),
  }).onConflictDoNothing({ target: faqSuggestions.groupmeMessageId });

  return Response.json({ accepted: true });
}
