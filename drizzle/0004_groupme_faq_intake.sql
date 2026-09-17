CREATE TABLE faq_suggestions (
  id TEXT PRIMARY KEY NOT NULL,
  groupme_message_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'living' CHECK (category IN ('money', 'arrival', 'classes', 'living', 'health')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'published', 'rejected', 'duplicate')),
  matched_faq_id TEXT,
  source_text TEXT,
  source_url TEXT,
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER,
  published_at INTEGER
);
CREATE UNIQUE INDEX idx_faq_suggestions_groupme_message ON faq_suggestions(groupme_message_id);
CREATE INDEX idx_faq_suggestions_status_created ON faq_suggestions(status, created_at);
