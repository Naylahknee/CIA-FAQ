import { clearSession, validSameOrigin } from "../../../../community-auth";

export async function POST(request: Request) {
  if (!await validSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
  await clearSession();
  return Response.json({ ok: true });
}
