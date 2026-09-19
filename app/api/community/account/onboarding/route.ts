import { getCommunityUser, noStoreJson, validSameOrigin } from "../../../../community-auth";
import { ensureD1AuthSchema } from "../../../../community-auth-schema";
import { readCommunityOnboarding } from "../../../../community-onboarding";
import { saveD1CommunityOnboarding } from "../../../../community-onboarding-d1";
import { getNeonAuthDb, neonAuthConfigured, saveNeonCommunityOnboarding } from "../../../../neon-auth";
import { env } from "cloudflare:workers";

function topics(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; }
}

export async function GET() {
  try {
    const user = await getCommunityUser();
    if (!user) return noStoreJson({ error: "Sign in first." }, { status: 401 });
    if (neonAuthConfigured()) {
      const rows = await getNeonAuthDb().query("SELECT member_type, student_stage, topics_json FROM auth_community_onboarding WHERE user_id=$1 LIMIT 1", [user.id]);
      const row = rows[0] as Record<string, unknown> | undefined;
      return noStoreJson({ onboarding: row ? { memberType: String(row.member_type), studentStage: String(row.student_stage), topics: topics(row.topics_json) } : null });
    }
    await ensureD1AuthSchema();
    const row = await env.DB.prepare("SELECT member_type, student_stage, topics_json FROM community_onboarding WHERE user_id=? LIMIT 1").bind(user.id).first<Record<string, unknown>>();
    return noStoreJson({ onboarding: row ? { memberType: String(row.member_type), studentStage: String(row.student_stage), topics: topics(row.topics_json) } : null });
  } catch { return noStoreJson({ error: "Community preferences could not be loaded." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    if (!await validSameOrigin(request)) return noStoreJson({ error: "Request could not be verified." }, { status: 403 });
    const user = await getCommunityUser();
    if (!user) return noStoreJson({ error: "Sign in first." }, { status: 401 });
    const data = await request.json() as Record<string, unknown>;
    const onboarding = readCommunityOnboarding(data);
    if (!onboarding.value) return noStoreJson({ error: onboarding.error ?? "Complete the community details." }, { status: 400 });
    if (neonAuthConfigured()) await saveNeonCommunityOnboarding(user.id, onboarding.value);
    else { await ensureD1AuthSchema(); await saveD1CommunityOnboarding(user.id, onboarding.value); }
    return noStoreJson({ ok: true });
  } catch {
    return noStoreJson({ error: "Community preferences could not be saved. Please try again." }, { status: 503 });
  }
}
