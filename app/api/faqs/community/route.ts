import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { faqSuggestions } from "../../../../db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getDb().select({
    id: faqSuggestions.id,
    question: faqSuggestions.question,
    answer: faqSuggestions.answer,
    category: faqSuggestions.category,
    sourceUrl: faqSuggestions.sourceUrl,
    publishedAt: faqSuggestions.publishedAt,
  }).from(faqSuggestions).where(eq(faqSuggestions.status, "published")).orderBy(asc(faqSuggestions.publishedAt));
  return Response.json({ faqs: rows }, { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } });
}
