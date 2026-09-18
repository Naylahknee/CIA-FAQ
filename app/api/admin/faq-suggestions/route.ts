import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { getDb } from "../../../../db";
import { faqSuggestions } from "../../../../db/schema";
import { getCommunityUser, validSameOrigin } from "../../../community-auth";

const categories = new Set(["money", "arrival", "classes", "living", "health"]);
const actions = new Set(["save", "approve", "publish", "reject", "unpublish"]);

function sourceUrl(value: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch { return null; }
}

export async function POST(request: Request) {
  if (!await validSameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const user = await getCommunityUser();
  if (!user || !user.emailVerified) return new Response("Sign in required", { status: 401 });
  const adminEmail = String(env.ADMIN_EMAIL ?? "").toLowerCase();
  if (user.role !== "moderator" && user.email.toLowerCase() !== adminEmail) return new Response("Forbidden", { status: 403 });

  const data = await request.formData();
  const id = String(data.get("id") ?? "");
  const action = String(data.get("action") ?? "");
  const question = String(data.get("question") ?? "").trim().slice(0, 300);
  const answer = String(data.get("answer") ?? "").trim().slice(0, 3000);
  const category = String(data.get("category") ?? "");
  const rawSourceUrl = String(data.get("sourceUrl") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !actions.has(action) || !categories.has(category) || !question || (rawSourceUrl && !sourceUrl(rawSourceUrl))) return new Response("Invalid request", { status: 400 });
  if (action === "publish" && !answer) return new Response("An answer is required before publication", { status: 400 });

  const now = new Date();
  const status = action === "save" ? "pending" : action === "unpublish" ? "approved" : action === "approve" ? "approved" : action === "publish" ? "published" : "rejected";
  await getDb().update(faqSuggestions).set({
    question,
    answer,
    category: category as "money" | "arrival" | "classes" | "living" | "health",
    sourceUrl: sourceUrl(rawSourceUrl),
    status: status as "pending" | "approved" | "published" | "rejected",
    reviewedAt: now,
    publishedAt: status === "published" ? now : null,
    sourceText: null,
  }).where(eq(faqSuggestions.id, id));
  redirect("/admin#faq-suggestions");
}
