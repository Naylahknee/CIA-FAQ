import { env } from "cloudflare:workers";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { createSession, noStoreJson, normalizeEmail, takeAuthAttempt, validSameOrigin } from "../../../../community-auth";
import { findOrCreateGoogleUser, mirrorCommunityUser, neonAuthConfigured, saveNeonCommunityOnboarding } from "../../../../neon-auth";
import { readCommunityOnboarding } from "../../../../community-onboarding";

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function POST(request: Request) {
  try {
    if (!await validSameOrigin(request)) return noStoreJson({ error: "Request could not be verified." }, { status: 403 });
    if (!neonAuthConfigured()) return noStoreJson({ error: "Google sign-in is not configured yet." }, { status: 503 });
    const clientId = String((env as unknown as Record<string, unknown>).GOOGLE_CLIENT_ID ?? "").trim();
    if (!clientId) return noStoreJson({ error: "Google sign-in is not configured yet." }, { status: 503 });
    const raw = await request.text();
    if (raw.length > 12_000) return noStoreJson({ error: "Request is too large." }, { status: 413 });
    const data = JSON.parse(raw) as Record<string, unknown>;
    const credential = String(data.credential ?? "");
    if (!credential) return noStoreJson({ error: "Google did not return a sign-in credential." }, { status: 400 });

    const limit = await takeAuthAttempt(request, "signin", "google");
    if (!limit.allowed) return noStoreJson({ error: "Too many sign-in attempts. Wait a few minutes and try again." }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });

    const { payload } = await jwtVerify(credential, googleKeys, {
      audience: clientId,
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      algorithms: ["RS256"],
    });
    const subject = String(payload.sub ?? "");
    const email = normalizeEmail(String(payload.email ?? ""));
    const displayName = String(payload.name ?? email.split("@")[0] ?? "Community member").replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 60);
    if (!subject || !payload.email_verified || !/^\S+@\S+\.\S+$/.test(email)) return noStoreJson({ error: "Google could not verify this email address." }, { status: 401 });

    const user = await findOrCreateGoogleUser({ subject, email, displayName: displayName.length >= 2 ? displayName : "Community member" });
    if (data.signupIntent === true) {
      const onboarding = readCommunityOnboarding(data);
      if (!onboarding.value) return noStoreJson({ error: onboarding.error ?? "Complete the community sign-up details." }, { status: 400 });
      await saveNeonCommunityOnboarding(user.id, onboarding.value);
    }
    await mirrorCommunityUser(user);
    await createSession(user.id);
    return noStoreJson({ ok: true });
  } catch {
    return noStoreJson({ error: "Google sign-in could not be completed. Please try again." }, { status: 401 });
  }
}
