import { desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { wallSubmissions } from "../../../db/schema";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET() {
  try {
    const rows = await getDb().select({ id: wallSubmissions.id, kind: wallSubmissions.kind, title: wallSubmissions.title, caption: wallSubmissions.caption, studentName: wallSubmissions.studentName, createdAt: wallSubmissions.createdAt })
      .from(wallSubmissions).where(eq(wallSubmissions.status, "approved")).orderBy(desc(wallSubmissions.createdAt)).limit(60);
    return Response.json({ submissions: rows.map((row) => ({ ...row, imageUrl: `/api/media/${row.id}` })) });
  } catch {
    return Response.json({ error: "The community wall is temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const kind = String(data.get("kind") ?? "");
    const title = String(data.get("title") ?? "").trim();
    const caption = String(data.get("caption") ?? "").trim();
    const studentName = String(data.get("studentName") ?? "").trim();
    const submitterEmail = String(data.get("submitterEmail") ?? "").trim();
    const consentName = String(data.get("consentName") ?? "").trim();
    const image = data.get("image");
    if (!(["memory", "resource"].includes(kind)) || !title || !caption || !submitterEmail || !consentName || data.get("consent") !== "on") return Response.json({ error: "Complete every required field and confirm permission." }, { status: 400 });
    if (!(image instanceof File) || image.size === 0 || image.size > MAX_IMAGE_BYTES || !IMAGE_TYPES.has(image.type)) return Response.json({ error: "Upload a JPG, PNG, or WebP image no larger than 8 MB." }, { status: 400 });
    const id = crypto.randomUUID();
    const extension = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
    const imageKey = `wall-submissions/${id}.${extension}`;
    await env.BUCKET.put(imageKey, image.stream(), { httpMetadata: { contentType: image.type } });
    await getDb().insert(wallSubmissions).values({ id, kind: kind as "memory" | "resource", title: title.slice(0, 120), caption: caption.slice(0, 600), studentName: studentName.slice(0, 80) || null, submitterEmail: submitterEmail.slice(0, 200), consentName: consentName.slice(0, 120), imageKey, imageType: image.type, createdAt: new Date() });
    return Response.json({ ok: true, message: "Submitted for review. Nothing is published automatically." }, { status: 201 });
  } catch {
    return Response.json({ error: "The submission could not be saved. Please try again." }, { status: 500 });
  }
}
