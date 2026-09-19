import { env } from "cloudflare:workers";

let ready: Promise<void> | null = null;

const schemaColumns = {
  community_users: new Map([
    ["password_iterations", "INTEGER NOT NULL DEFAULT 210000"],
    ["email_verified", "INTEGER NOT NULL DEFAULT 0"],
    ["mfa_secret", "TEXT"],
    ["mfa_pending", "TEXT"],
    ["mfa_last_step", "INTEGER NOT NULL DEFAULT -1"],
  ]),
  community_posts: new Map([
    ["topic_id", "TEXT"],
    ["is_anonymous", "INTEGER NOT NULL DEFAULT 0"],
  ]),
} as const;

type SchemaTable = keyof typeof schemaColumns;

async function addMissingColumn(table: SchemaTable, column: string) {
  const definition = schemaColumns[table].get(column);
  if (!definition) throw new Error("Unsupported schema migration.");
  // SQL parameters cannot represent table or column identifiers. Both values are
  // selected from this closed, source-controlled allow-list before interpolation.
  const rows = await env.DB.prepare(`PRAGMA table_info("${table}")`).all<{ name: string }>();
  if (!rows.results.some((row: { name: string }) => row.name === column)) {
    await env.DB.prepare(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`).run();
  }
}

async function prepareSchema() {
  await addMissingColumn("community_users", "password_iterations");
  await addMissingColumn("community_users", "email_verified");
  await addMissingColumn("community_users", "mfa_secret");
  await addMissingColumn("community_users", "mfa_pending");
  await addMissingColumn("community_users", "mfa_last_step");
  await addMissingColumn("community_posts", "topic_id");
  await addMissingColumn("community_posts", "is_anonymous");
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS auth_rate_limits (key TEXT PRIMARY KEY NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, window_start INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS account_tokens (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE, purpose TEXT NOT NULL, expires_at INTEGER NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS account_tokens_user ON account_tokens(user_id)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS recovery_codes (code_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_recovery_codes_user ON recovery_codes(user_id)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS community_topics (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, created_by TEXT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE, status TEXT NOT NULL DEFAULT 'active', created_at INTEGER NOT NULL)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_community_topics_status_created ON community_topics(status, created_at)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS community_onboarding (user_id TEXT PRIMARY KEY REFERENCES community_users(id) ON DELETE CASCADE, member_type TEXT NOT NULL, student_stage TEXT NOT NULL, guidelines_accepted_at INTEGER NOT NULL, privacy_accepted_at INTEGER NOT NULL, created_at INTEGER NOT NULL)"),
  ]);
}

export function ensureD1AuthSchema() {
  ready ??= prepareSchema().catch(error => {
    ready = null;
    throw error;
  });
  return ready;
}
