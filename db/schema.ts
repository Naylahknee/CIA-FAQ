import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const wallSubmissions = sqliteTable("wall_submissions", {
  id: text("id").primaryKey(),
  kind: text("kind", { enum: ["memory", "resource"] }).notNull(),
  title: text("title").notNull(),
  caption: text("caption").notNull(),
  studentName: text("student_name"),
  submitterEmail: text("submitter_email").notNull(),
  consentName: text("consent_name").notNull(),
  imageKey: text("image_key").notNull(),
  imageType: text("image_type").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
}, (table) => [index("idx_wall_submissions_status_created").on(table.status, table.createdAt)]);

export const corrections = sqliteTable("corrections", {
  id: text("id").primaryKey(),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  sourceUrl: text("source_url"),
  submitterEmail: text("submitter_email"),
  status: text("status", { enum: ["open", "resolved"] }).notNull().default("open"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("idx_corrections_status_created").on(table.status, table.createdAt)]);

export const communityUsers = sqliteTable("community_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  passwordIterations: integer("password_iterations").notNull().default(210000),
  mfaSecret: text("mfa_secret"),
  mfaPending: text("mfa_pending"),
  mfaLastStep: integer("mfa_last_step").notNull().default(-1),
  role: text("role", { enum: ["member", "moderator", "admin"] }).notNull().default("member"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("idx_community_users_email").on(table.email)]);

export const communitySessions = sqliteTable("community_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => communityUsers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  uniqueIndex("idx_community_sessions_token").on(table.tokenHash),
  index("idx_community_sessions_user").on(table.userId),
]);

export const communityPosts = sqliteTable("community_posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => communityUsers.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  mediaKey: text("media_key"),
  mediaType: text("media_type"),
  gifUrl: text("gif_url"),
  topicId: text("topic_id"),
  isAnonymous: integer("is_anonymous", { mode: "boolean" }).notNull().default(false),
  status: text("status", { enum: ["published", "removed"] }).notNull().default("published"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("idx_community_posts_status_created").on(table.status, table.createdAt)]);

export const communityTopics = sqliteTable("community_topics", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: text("created_by").notNull().references(() => communityUsers.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["active", "archived"] }).notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("idx_community_topics_name").on(table.name), index("idx_community_topics_status_created").on(table.status, table.createdAt)]);

export const communityComments = sqliteTable("community_comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => communityUsers.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  status: text("status", { enum: ["published", "removed"] }).notNull().default("published"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("idx_community_comments_post_created").on(table.postId, table.createdAt)]);

export const communityReactions = sqliteTable("community_reactions", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => communityUsers.id, { onDelete: "cascade" }),
  reaction: text("reaction", { enum: ["like", "love", "celebrate", "support"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("idx_community_reactions_post_user").on(table.postId, table.userId)]);

export const communityReports = sqliteTable("community_reports", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => communityUsers.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["open", "resolved"] }).notNull().default("open"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("idx_community_reports_post_user").on(table.postId, table.userId)]);


export const authRateLimits = sqliteTable("auth_rate_limits", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull().default(0),
  windowStart: integer("window_start").notNull(),
});

export const accountTokens = sqliteTable("account_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull().references(() => communityUsers.id, { onDelete: "cascade" }),
  purpose: text("purpose", { enum: ["verify", "reset"] }).notNull(),
  expiresAt: integer("expires_at").notNull(),
}, (table) => [index("idx_account_tokens_user").on(table.userId)]);

export const recoveryCodes = sqliteTable("recovery_codes", {
  codeHash: text("code_hash").primaryKey(),
  userId: text("user_id").notNull().references(() => communityUsers.id, { onDelete: "cascade" }),
}, (table) => [index("idx_recovery_codes_user").on(table.userId)]);

export const scholarshipContributions = sqliteTable("scholarship_contributions", {
  id: text("id").primaryKey(),
  providerReference: text("provider_reference").notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "refunded"] }).notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  uniqueIndex("idx_scholarship_contributions_provider_reference").on(table.providerReference),
  index("idx_scholarship_contributions_status_created").on(table.status, table.createdAt),
]);

export const faqSuggestions = sqliteTable("faq_suggestions", {
  id: text("id").primaryKey(),
  groupmeMessageId: text("groupme_message_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull().default(""),
  category: text("category", { enum: ["money", "arrival", "classes", "living", "health"] }).notNull().default("living"),
  status: text("status", { enum: ["pending", "approved", "published", "rejected", "duplicate"] }).notNull().default("pending"),
  matchedFaqId: text("matched_faq_id"),
  sourceText: text("source_text"),
  sourceUrl: text("source_url"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }),
}, (table) => [
  uniqueIndex("idx_faq_suggestions_groupme_message").on(table.groupmeMessageId),
  index("idx_faq_suggestions_status_created").on(table.status, table.createdAt),
]);

/** The searchable corpus, flattened into one shape so a single FTS5 index can
 *  cover both halves of the site's content:
 *
 *  - `guide`     — the authored FAQs in app/guide-data.ts, which ship with the
 *                  build rather than living in D1. They are synced in by
 *                  app/search-corpus.ts whenever the content version changes.
 *  - `community` — rows published from the admin FAQ form, projected in here by
 *                  database triggers so publishing an answer makes it findable
 *                  with no extra application code.
 *
 *  Nothing reads this table directly for display: `ref_id` points back at the
 *  original record, which is where the icons, per-audience wording and links
 *  live. This exists to be indexed. */
export const searchDocuments = sqliteTable("search_documents", {
  id: text("id").primaryKey(),
  source: text("source", { enum: ["guide", "community"] }).notNull(),
  refId: text("ref_id").notNull(),
  category: text("category").notNull().default("living"),
  /** Empty means "applies to every term"; otherwise a comma-separated list such
   *  as "fall" so Fall-only dates stay out of a Spring search. */
  terms: text("terms").notNull().default(""),
  href: text("href").notNull().default("/faq"),
  title: text("title").notNull(),
  altTitle: text("alt_title").notNull().default(""),
  body: text("body").notNull().default(""),
  tags: text("tags").notNull().default(""),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("idx_search_documents_source").on(table.source)]);

/** Small key/value side table. Currently holds one row: the version stamp of
 *  the guide corpus that was last synced, so a deploy that changes an answer
 *  re-syncs and a deploy that does not costs nothing. */
export const searchMeta = sqliteTable("search_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
