import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { getDb } from "../../../../db";
import { corrections, wallSubmissions } from "../../../../db/schema";
import { getCommunityUser, validSameOrigin } from "../../../community-auth";

export async function POST(request: Request) {
  if (!await validSameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const user = await getCommunityUser();
  if (!user || !user.emailVerified) return new Response("Sign in required", { status: 401 });
  const adminEmail = String(env.ADMIN_EMAIL ?? "").toLowerCase();
  if (user.role !== "moderator" && user.email.toLowerCase() !== adminEmail) return new Response("Forbidden", { status: 403 });
  const data = await request.formData();
  const type = String(data.get("type") ?? "");
  const id = String(data.get("id") ?? "");
  const action = String(data.get("action") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Invalid request", { status: 400 });
  if (type === "submission" && ["approved", "rejected"].includes(action)) {
    await getDb().update(wallSubmissions).set({ status: action as "approved" | "rejected", reviewedAt: new Date() }).where(eq(wallSubmissions.id, id));
  } else if (type === "correction" && action === "resolved") {
    await getDb().update(corrections).set({ status: "resolved" }).where(eq(corrections.id, id));
  } else {
    return new Response("Invalid request", { status: 400 });
  }
  redirect("/admin");
}
