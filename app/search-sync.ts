import { env } from "cloudflare:workers";
import { buildCorpus, contentVersion } from "./search-corpus";

const VERSION_KEY = "guide_corpus_version";

/** Per-isolate latch. The guide corpus ships with the build, so it can only
 *  change when a new version is deployed -- checking once per isolate rather
 *  than once per search keeps this off the hot path. */
let syncInFlight: Promise<void> | null = null;

/** Push the authored answers into `search_documents` so the FTS5 index covers
 *  them as well as the rows published from the admin page.
 *
 *  Written against the D1 binding rather than Drizzle: this needs one atomic
 *  batch, and `batch()` on the binding is the documented way to get it. The
 *  query path in app/api/search/route.ts uses Drizzle's `sql` as usual --
 *  nothing here is interpolated from user input. */
async function syncGuideCorpus(): Promise<void> {
  const db = env.DB;
  const documents = buildCorpus();
  const version = contentVersion(documents);

  const current = await db.prepare("SELECT value FROM search_meta WHERE key = ?").bind(VERSION_KEY).first<{ value: string }>();
  if (current?.value === version) return;

  const insert = db.prepare(`
    INSERT INTO search_documents (id, source, ref_id, category, terms, href, title, alt_title, body, tags, updated_at)
    VALUES (?, 'guide', ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const now = Date.now();

  // Replace the guide half wholesale. Community rows are written by database
  // triggers and are left untouched. The delete cascades into faqs_search
  // through the search_documents_ad trigger, so no stale answer survives.
  await db.batch([
    db.prepare("DELETE FROM search_documents WHERE source = 'guide'"),
    ...documents.map((doc) => insert.bind(doc.id, doc.refId, doc.category, doc.terms, doc.href, doc.title, doc.altTitle, doc.body, doc.tags, now)),
    db.prepare("INSERT INTO search_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(VERSION_KEY, version),
  ]);
}

export function ensureGuideCorpus(): Promise<void> {
  if (!syncInFlight) {
    syncInFlight = syncGuideCorpus().catch((cause) => {
      // Let the next request try again rather than latching a failure for the
      // lifetime of the isolate.
      syncInFlight = null;
      throw cause;
    });
  }
  return syncInFlight;
}
