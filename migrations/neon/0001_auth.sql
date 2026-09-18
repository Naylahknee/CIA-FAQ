-- CIA Questions authentication schema for Neon PostgreSQL.
-- Apply with: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/neon/0001_auth.sql

BEGIN;

CREATE TABLE IF NOT EXISTS auth_users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  email_normalized text NOT NULL UNIQUE,
  display_name varchar(60) NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 60),
  email_verified_at timestamptz,
  role varchar(20) NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator')),
  mfa_secret text,
  mfa_pending text,
  mfa_last_step bigint NOT NULL DEFAULT -1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_credentials (
  user_id uuid PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  password_hash varchar(128) NOT NULL,
  password_salt varchar(64) NOT NULL,
  password_iterations integer NOT NULL CHECK (password_iterations >= 100000),
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_oauth_accounts (
  provider varchar(32) NOT NULL,
  provider_subject varchar(255) NOT NULL,
  user_id uuid NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, provider_subject),
  UNIQUE (provider, user_id)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_sessions_user_idx ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS auth_sessions_expiry_idx ON auth_sessions(expires_at);

CREATE TABLE IF NOT EXISTS auth_tokens (
  token_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  purpose varchar(16) NOT NULL CHECK (purpose IN ('verify', 'reset')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_tokens_user_idx ON auth_tokens(user_id);

CREATE TABLE IF NOT EXISTS auth_recovery_codes (
  code_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_recovery_codes_user_idx ON auth_recovery_codes(user_id);

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  key char(64) PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL
);

COMMIT;
