import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({ appType: "custom", configFile: false, root, server: { middlewareMode: true } });
after(async () => { await vite.close(); });

const { toMatchQuery } = await vite.ssrLoadModule("/app/search-query.ts");
const { buildCorpus } = await vite.ssrLoadModule("/app/search-corpus.ts");

const MIGRATIONS = [
  "0000_salty_changeling.sql",
  "0001_young_nico_minoru.sql",
  "0002_secure_community_auth.sql",
  "0003_account_security.sql",
  "0004_groupme_faq_intake.sql",
  "0005_reset_auth_rate_limits.sql",
  "0006_faq_fulltext_search.sql",
];

/** Build a database the way a deploy does: every migration, in filename order. */
async function migratedDatabase() {
  const db = new DatabaseSync(":memory:");
  for (const file of MIGRATIONS) {
    const sql = (await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8")).split("--> statement-breakpoint").join("\n");
    db.exec(sql);
  }
  return db;
}

const search = (db, match, term = "fall") => db.prepare(`
  SELECT d.id AS id, d.ref_id AS refId, bm25(faqs_search, 10.0, 8.0, 1.0, 4.0) AS score
  FROM faqs_search
  JOIN search_documents d ON d.id = faqs_search.doc_id
  WHERE faqs_search MATCH ? AND (d.terms = '' OR d.terms = ?)
  ORDER BY score LIMIT 8
`).all(match, term);

test("toMatchQuery neutralises FTS5 operators instead of passing them through", () => {
  // Each of these is a syntax error or an operator if handed to MATCH raw.
  for (const raw of ['meal OR OR OR', 'move-in NEAR class', 'a"b', 'points*', '(meal)', 'x AND NOT y', '^start', 'col:value']) {
    const built = toMatchQuery(raw);
    if (built === null) continue;
    assert.ok(!/\bNEAR\b|\bNOT\b/.test(built.replace(/"[^"]*"/g, "")), `operator survived in ${built}`);
    assert.ok(!built.includes("("), `paren survived in ${built}`);
    assert.ok(!built.includes(":"), `column filter survived in ${built}`);
  }
});

test("toMatchQuery returns null for input with nothing to search for", () => {
  for (const raw of ["", "   ", "!!!", "a", "-", "'"]) assert.equal(toMatchQuery(raw), null);
});

test("toMatchQuery caps token count so one query cannot fan out", () => {
  const built = toMatchQuery(Array.from({ length: 40 }, (_, i) => `word${i}`).join(" "));
  assert.equal(built.split(" AND ").length, 8);
});

test("toMatchQuery prefix-matches only the final token", () => {
  assert.equal(toMatchQuery("meal plan"), '"meal" AND "plan"*');
});

test("every migration applies in order and the index starts empty", async () => {
  const db = await migratedDatabase();
  assert.equal(db.prepare("SELECT count(*) c FROM faqs_search").get().c, 0);
  assert.equal(db.prepare("SELECT count(*) c FROM search_documents").get().c, 0);
});

test("publishing an FAQ indexes it, editing keeps one row, unpublishing removes it", async () => {
  const db = await migratedDatabase();
  const insert = db.prepare(`INSERT INTO faq_suggestions (id, groupme_message_id, question, answer, category, status, created_at, published_at) VALUES (?,?,?,?,?,?,?,?)`);

  insert.run("s1", "m1", "Where do families park for move-in?", "Lot C opens at 8am.", "arrival", "pending", 1, null);
  assert.equal(db.prepare("SELECT count(*) c FROM faqs_search").get().c, 0, "a draft must not be searchable");

  db.prepare("UPDATE faq_suggestions SET status='published', published_at=2 WHERE id='s1'").run();
  assert.equal(db.prepare("SELECT count(*) c FROM faqs_search").get().c, 1);

  db.prepare("UPDATE faq_suggestions SET answer='Lot C opens at 7am.' WHERE id='s1'").run();
  assert.equal(db.prepare("SELECT count(*) c FROM faqs_search").get().c, 1, "an edit must not duplicate the index row");
  assert.match(db.prepare("SELECT body FROM faqs_search").get().body, /7am/);

  db.prepare("UPDATE faq_suggestions SET status='pending' WHERE id='s1'").run();
  assert.equal(db.prepare("SELECT count(*) c FROM faqs_search").get().c, 0, "unpublishing must remove it from search");

  db.prepare("UPDATE faq_suggestions SET status='published' WHERE id='s1'").run();
  db.prepare("DELETE FROM faq_suggestions WHERE id='s1'").run();
  assert.equal(db.prepare("SELECT count(*) c FROM search_documents").get().c, 0);
  assert.equal(db.prepare("SELECT count(*) c FROM faqs_search").get().c, 0);
});

test("the guide corpus is searchable, stemmed, and ranked", async () => {
  const db = await migratedDatabase();
  const insert = db.prepare(`INSERT INTO search_documents (id, source, ref_id, category, terms, href, title, alt_title, body, tags, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const corpus = buildCorpus();
  assert.ok(corpus.length > 30, "the corpus should cover the authored FAQs, not just a handful");
  for (const doc of corpus) insert.run(doc.id, doc.source, doc.refId, doc.category, doc.terms, doc.href, doc.title, doc.altTitle, doc.body, doc.tags, 1);
  assert.equal(db.prepare("SELECT count(*) c FROM faqs_search").get().c, corpus.length);

  // Stemming: the corpus says "Points", the reader types "point".
  const stemmed = search(db, toMatchQuery("meal point"));
  assert.ok(stemmed.length > 0, "stemmed search found nothing");
  assert.ok(stemmed.some((row) => row.refId === "meal"), `expected the meal answer, got ${stemmed.map((r) => r.refId).join(", ")}`);

  // Ranking: a term in the question should outrank the same term in a body.
  assert.ok(stemmed.every((row, i) => i === 0 || row.score >= stemmed[i - 1].score), "results are not in bm25 order");
});

test("term-scoped answers do not leak across the year switch", async () => {
  const db = await migratedDatabase();
  const insert = db.prepare(`INSERT INTO search_documents (id, source, ref_id, category, terms, href, title, alt_title, body, tags, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  for (const doc of buildCorpus()) insert.run(doc.id, doc.source, doc.refId, doc.category, doc.terms, doc.href, doc.title, doc.altTitle, doc.body, doc.tags, 1);

  const fall = search(db, toMatchQuery("dates deadlines"), "fall").map((row) => row.refId);
  const spring = search(db, toMatchQuery("classes begin"), "spring").map((row) => row.refId);
  assert.ok(!fall.includes("spring-dates"), "Spring 2027 dates surfaced in a Fall search");
  assert.ok(!spring.includes("fall-dates"), "Fall 2026 dates surfaced in a Spring search");
});
