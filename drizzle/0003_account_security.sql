ALTER TABLE community_users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;
ALTER TABLE community_users ADD COLUMN mfa_secret TEXT;
ALTER TABLE community_users ADD COLUMN mfa_pending TEXT;
ALTER TABLE community_users ADD COLUMN mfa_last_step INTEGER NOT NULL DEFAULT -1;
CREATE TABLE account_tokens (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE, purpose TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX account_tokens_user ON account_tokens(user_id);
CREATE TABLE recovery_codes (code_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE);
CREATE INDEX idx_recovery_codes_user ON recovery_codes(user_id);
CREATE TABLE scholarship_contributions (
  id TEXT PRIMARY KEY,
  provider_reference TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'refunded')),
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX idx_scholarship_contributions_provider_reference ON scholarship_contributions(provider_reference);
CREATE INDEX idx_scholarship_contributions_status_created ON scholarship_contributions(status, created_at);
