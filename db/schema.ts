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
  role: text("role", { enum: ["member", "moderator"] }).notNull().default("member"),
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
  status: text("status", { enum: ["published", "removed"] }).notNull().default("published"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("idx_community_posts_status_created").on(table.status, table.createdAt)]);

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
