import { clearSession, noStoreJson, validSameOrigin } from "../../../../community-auth";

export async function POST(request: Request) {
  if (!await validSameOrigin(request)) return noStoreJson({ error: "Request could not be verified." }, { status: 403 });
  await clearSession();
  return noStoreJson({ ok: true });
}
