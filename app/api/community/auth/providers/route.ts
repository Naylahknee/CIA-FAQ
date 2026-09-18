import { env } from "cloudflare:workers";
import { noStoreJson } from "../../../../community-auth";
import { neonAuthConfigured } from "../../../../neon-auth";

export async function GET() {
  const clientId = String((env as unknown as Record<string, unknown>).GOOGLE_CLIENT_ID ?? "").trim();
  return noStoreJson({ google: neonAuthConfigured() && clientId ? { clientId } : null });
}
