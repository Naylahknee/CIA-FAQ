import { env } from "cloudflare:workers";
import type { CommunityOnboarding } from "./community-onboarding";

export async function saveD1CommunityOnboarding(userId: string, onboarding: CommunityOnboarding) {
  const now = Date.now();
  await env.DB.prepare(`INSERT INTO community_onboarding
    (user_id, member_type, student_stage, topics_json, guidelines_accepted_at, privacy_accepted_at, onboarding_completed_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET member_type=excluded.member_type, student_stage=excluded.student_stage,
      topics_json=excluded.topics_json, guidelines_accepted_at=excluded.guidelines_accepted_at,
      privacy_accepted_at=excluded.privacy_accepted_at, onboarding_completed_at=excluded.onboarding_completed_at`)
    .bind(userId, onboarding.memberType, onboarding.studentStage, JSON.stringify(onboarding.topics), now, now, now, now).run();
}
