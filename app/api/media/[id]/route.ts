import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { wallSubmissions } from "../../../../db/schema";
import { headers } from "next/headers";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const [row] = await getDb().select().from(wallSubmissions).where(eq(wallSubmissions.id, id)).limit(1);
  const requestHeaders = await headers();
  const viewerEmail = requestHeaders.get("oai-authenticated-user-email")?.toLowerCase();
  const adminEmail = String(env.ADMIN_EMAIL ?? "").toLowerCase();
  if (!row || (row.status !== "approved" && viewerEmail !== adminEmail)) return new Response("Not found", { status: 404 });
  const object = await env.BUCKET.get(row.imageKey);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, { headers: { "content-type": row.imageType, "cache-control": "public, max-age=3600" } });
}
