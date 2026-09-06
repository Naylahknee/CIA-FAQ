import { getCommunityUser } from "../../../../community-auth";

export async function GET() {
  try { return Response.json({ user: await getCommunityUser() }); }
  catch { return Response.json({ user: null }); }
}
