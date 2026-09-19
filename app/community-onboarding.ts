export const MEMBER_TYPES = ["parent_guardian", "family_support", "cia_student", "other_supporter"] as const;
export const STUDENT_STAGES = ["currently_attending", "starting_spring_2027", "starting_future", "exploring", "prefer_not_to_say"] as const;
export const COMMUNITY_TOPICS = ["Campus life and housing", "Classes, uniforms, kits, and supplies", "Travel and visits", "Food, meal plans, and groceries", "Health, safety, and support resources", "Jobs and student life", "Family Weekend and events", "Financial planning and payments", "General parent support"] as const;

export type CommunityOnboarding = { memberType: (typeof MEMBER_TYPES)[number]; studentStage: (typeof STUDENT_STAGES)[number]; topics: string[] };

export function readCommunityOnboarding(input: Record<string, unknown>): { value?: CommunityOnboarding; error?: string } {
  const memberType = String(input.memberType ?? "");
  const studentStage = String(input.studentStage ?? "prefer_not_to_say");
  const rawTopics = Array.isArray(input.topics) ? input.topics : input.topics ? [input.topics] : [];
  const topics = rawTopics.map(String);
  const safetyAccepted = input.safetyAccepted === true || input.safetyAccepted === "on";
  if (!MEMBER_TYPES.includes(memberType as CommunityOnboarding["memberType"])) return { error: "Choose how you are joining the community." };
  if (!STUDENT_STAGES.includes(studentStage as CommunityOnboarding["studentStage"])) return { error: "Choose a valid CIA journey stage." };
  if (topics.length > COMMUNITY_TOPICS.length || topics.some((topic) => !COMMUNITY_TOPICS.includes(topic as typeof COMMUNITY_TOPICS[number]))) return { error: "Choose topics from the provided list." };
  if (!safetyAccepted) return { error: "Confirm the community-safety commitment to continue." };
  return { value: { memberType: memberType as CommunityOnboarding["memberType"], studentStage: studentStage as CommunityOnboarding["studentStage"], topics } };
}
