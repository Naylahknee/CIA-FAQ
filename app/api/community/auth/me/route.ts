import { getCommunityUser, noStoreJson } from "../../../../community-auth";

export async function GET() {
  try { return noStoreJson({ user: await getCommunityUser() }); }
  catch { return noStoreJson({ user: null }); }
}
