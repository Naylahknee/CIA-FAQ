import { sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { toMatchQuery } from "../../search-query";
import { ensureGuideCorpus } from "../../search-sync";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 8;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const term = url.searchParams.get("term") === "spring" ? "spring" : "fall";
  const match = toMatchQuery(query);

  if (!match) return Response.json({ results: [], query }, { headers: { "cache-control": "no-store" } });

  try {
    await ensureGuideCorpus();

    // bm25 weights the columns: a hit in the question outranks a hit buried in
    // the body, and the tags carry the topic name so "campus life" finds its
    // section. bm25 returns a negative score where more negative is a better
    // match, so plain ascending order is relevance order.
    const rows = await getDb().all<SearchHit & { score: number }>(sql`
      SELECT d.id          AS id,
             d.source      AS source,
             d.ref_id      AS refId,
             d.category    AS category,
             d.href        AS href,
             d.title       AS title,
             d.alt_title   AS altTitle,
             bm25(faqs_search, 10.0, 8.0, 1.0, 4.0) AS score
      FROM faqs_search
      JOIN search_documents d ON d.id = faqs_search.doc_id
      WHERE faqs_search MATCH ${match}
        AND (d.terms = '' OR d.terms = ${term})
      ORDER BY score
      LIMIT ${MAX_RESULTS}
    `);

    // The rows are already in relevance order and every consumer must preserve
    // it, so the array order is the contract -- score is returned only so a
    // caller can show or debug it, never to re-sort by.
    return Response.json(
      { results: rows, query, term },
      { headers: { "cache-control": "private, max-age=30" } },
    );
  } catch (cause) {
    // The index lives in D1 and the answers do not: every caller can fall back
    // to filtering its own copy of the guide. Say so explicitly rather than
    // returning an empty result set, which would read as "no such answer".
    console.error("faq search failed", { cause: cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause) });
    return Response.json({ results: [], query, unavailable: true }, { status: 200, headers: { "cache-control": "no-store" } });
  }
}
