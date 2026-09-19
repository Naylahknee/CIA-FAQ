BEGIN;

ALTER TABLE auth_users DROP CONSTRAINT IF EXISTS auth_users_role_check;
ALTER TABLE auth_users ADD CONSTRAINT auth_users_role_check
  CHECK (role IN ('member', 'moderator', 'admin'));

ALTER TABLE auth_community_onboarding ADD COLUMN IF NOT EXISTS topics_json jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE auth_community_onboarding ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

COMMIT;
