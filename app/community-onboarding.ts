import { env } from "cloudflare:workers";

export const MEMBER_TYPES = ["parent_guardian", "student", "family_supporter"] as const;
export const STUDENT_STAGES = ["currently_enrolled", "starting_spring_2027", "starting_later", "exploring"] as const;

export type CommunityOnboarding = {
  memberType: (typeof MEMBER_TYPES)[number];
  studentStage: (typeof STUDENT_STAGES)[number];
};

export function readCommunityOnboarding(input: Record<string, unknown>): { value?: CommunityOnboarding; error?: string } {
  const memberType = String(input.memberType ?? "");
  const studentStage = String(input.studentStage ?? "");
  const guidelinesAccepted = input.guidelinesAccepted === true || input.guidelinesAccepted === "on";
  const privacyAccepted = input.privacyAccepted === true || input.privacyAccepted === "on";
  if (!MEMBER_TYPES.includes(memberType as CommunityOnboarding["memberType"])) return { error: "Choose how you are connected to CIA." };
  if (!STUDENT_STAGES.includes(studentStage as CommunityOnboarding["studentStage"])) return { error: "Choose the student’s current or expected CIA stage." };
  if (!guidelinesAccepted || !privacyAccepted) return { error: "Confirm the community and privacy commitments to continue." };
  return { value: { memberType: memberType as CommunityOnboarding["memberType"], studentStage: studentStage as CommunityOnboarding["studentStage"] } };
}

export async function saveD1CommunityOnboarding(userId: string, onboarding: CommunityOnboarding) {
  await env.DB.prepare(`INSERT INTO community_onboarding
    (user_id, member_type, student_stage, guidelines_accepted_at, privacy_accepted_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET member_type=excluded.member_type, student_stage=excluded.student_stage,
      guidelines_accepted_at=excluded.guidelines_accepted_at, privacy_accepted_at=excluded.privacy_accepted_at`)
    .bind(userId, onboarding.memberType, onboarding.studentStage, Date.now(), Date.now(), Date.now()).run();
}
