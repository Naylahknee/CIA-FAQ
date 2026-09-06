import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "../../../../db";
import { corrections, wallSubmissions } from "../../../../db/schema";

export async function POST(request: Request) {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email")?.toLowerCase();
  if (!email || email !== String(env.ADMIN_EMAIL ?? "").toLowerCase()) return new Response("Forbidden", { status: 403 });
  const data = await request.formData();
  const type = String(data.get("type") ?? "");
  const id = String(data.get("id") ?? "");
  const action = String(data.get("action") ?? "");
  if (type === "submission" && ["approved", "rejected"].includes(action)) {
    await getDb().update(wallSubmissions).set({ status: action as "approved" | "rejected", reviewedAt: new Date() }).where(eq(wallSubmissions.id, id));
  } else if (type === "correction" && action === "resolved") {
    await getDb().update(corrections).set({ status: "resolved" }).where(eq(corrections.id, id));
  }
  redirect("/admin");
}
