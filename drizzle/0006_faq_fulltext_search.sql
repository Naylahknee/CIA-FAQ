-- Full-text search over the whole FAQ corpus.
--
-- Hand-written rather than generated: drizzle-kit's snapshot for this project
-- only covers migrations 0000-0001 (0002-0005 were written by hand), so
-- `drizzle-kit generate` emits CREATE TABLE for tables that already exist.
-- FTS5 virtual tables and triggers cannot be expressed in a Drizzle schema
-- either, so this file is the source of truth for both.

CREATE TABLE search_documents (
  id TEXT PRIMARY KEY NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('guide', 'community')),
  ref_id TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'living',
  terms TEXT NOT NULL DEFAULT '',
  href TEXT NOT NULL DEFAULT '/faq',
  title TEXT NOT NULL,
  alt_title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX idx_search_documents_source ON search_documents(source);
--> statement-breakpoint
CREATE TABLE search_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
--> statement-breakpoint
-- A regular (content-storing) FTS5 table, not an external-content one. The
-- corpus is small enough that the duplicated text is irrelevant, and a regular
-- table supports plain DELETE, which keeps the triggers below readable and
-- avoids the 'delete' sentinel-row dance external content requires.
-- Porter stemming is what makes "parking" find "park" and "points" find
-- "point", which is most of the value over the substring match this replaces.
CREATE VIRTUAL TABLE faqs_search USING fts5(
  doc_id UNINDEXED,
  title,
  alt_title,
  body,
  tags,
  tokenize = 'porter unicode61 remove_diacritics 2'
);
--> statement-breakpoint
CREATE TRIGGER search_documents_ai AFTER INSERT ON search_documents BEGIN
  INSERT INTO faqs_search(doc_id, title, alt_title, body, tags)
  VALUES (new.id, new.title, new.alt_title, new.body, new.tags);
END;
--> statement-breakpoint
CREATE TRIGGER search_documents_ad AFTER DELETE ON search_documents BEGIN
  DELETE FROM faqs_search WHERE doc_id = old.id;
END;
--> statement-breakpoint
CREATE TRIGGER search_documents_au AFTER UPDATE ON search_documents BEGIN
  DELETE FROM faqs_search WHERE doc_id = old.id;
  INSERT INTO faqs_search(doc_id, title, alt_title, body, tags)
  VALUES (new.id, new.title, new.alt_title, new.body, new.tags);
END;
--> statement-breakpoint
-- Publishing an FAQ from the admin page makes it searchable with no extra
-- application code. Each trigger deletes first and then re-inserts only when
-- the row is published, so unpublishing removes it from the index too.
--
-- Deliberately DELETE + INSERT rather than INSERT OR REPLACE: when REPLACE
-- resolves a conflict it fires delete triggers only if PRAGMA recursive_triggers
-- is on, which it is not by default. That would leave the old row in
-- faqs_search and add a second one, so every edit would double the hits.
CREATE TRIGGER faq_suggestions_search_ai AFTER INSERT ON faq_suggestions BEGIN
  DELETE FROM search_documents WHERE id = 'community:' || new.id;
  INSERT INTO search_documents (id, source, ref_id, category, terms, href, title, alt_title, body, tags, updated_at)
  SELECT 'community:' || new.id, 'community', new.id, new.category, '', '/faq',
         new.question, '', new.answer, COALESCE(new.source_url, ''),
         COALESCE(new.published_at, new.reviewed_at, new.created_at)
  WHERE new.status = 'published';
END;
--> statement-breakpoint
CREATE TRIGGER faq_suggestions_search_au AFTER UPDATE ON faq_suggestions BEGIN
  DELETE FROM search_documents WHERE id = 'community:' || old.id;
  INSERT INTO search_documents (id, source, ref_id, category, terms, href, title, alt_title, body, tags, updated_at)
  SELECT 'community:' || new.id, 'community', new.id, new.category, '', '/faq',
         new.question, '', new.answer, COALESCE(new.source_url, ''),
         COALESCE(new.published_at, new.reviewed_at, new.created_at)
  WHERE new.status = 'published';
END;
--> statement-breakpoint
CREATE TRIGGER faq_suggestions_search_ad AFTER DELETE ON faq_suggestions BEGIN
  DELETE FROM search_documents WHERE id = 'community:' || old.id;
END;
--> statement-breakpoint
-- One-time backfill of everything already published. The insert trigger above
-- only covers rows written from now on, and the guide corpus is synced in
-- separately by app/search-corpus.ts once the Worker is running.
INSERT INTO search_documents (id, source, ref_id, category, terms, href, title, alt_title, body, tags, updated_at)
SELECT 'community:' || id, 'community', id, category, '', '/faq',
       question, '', answer, COALESCE(source_url, ''),
       COALESCE(published_at, reviewed_at, created_at)
FROM faq_suggestions
WHERE status = 'published';
--> statement-breakpoint
-- Rebuild rather than trusting the backfill's own triggers to have populated
-- the index: cheap here, and it makes the migration safe to reason about on
-- its own.
INSERT INTO faqs_search(faqs_search) VALUES('rebuild');
