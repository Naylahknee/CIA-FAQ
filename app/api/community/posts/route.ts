import { stripImageMetadata } from "../../../image-metadata";
import { desc, eq, sql } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { requireCommunityUser, takeAuthAttempt, validSameOrigin } from "../../../community-auth";
import { getDb } from "../../../../db";
import { communityComments, communityPosts, communityReactions, communityTopics, communityUsers } from "../../../../db/schema";
import { isSafeImage } from "../../../image-security";
import { ensureD1AuthSchema } from "../../../community-auth-schema";

const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function GET() {
  try {
    const user = await requireCommunityUser();
    await ensureD1AuthSchema();
    const posts = await getDb().select({ id: communityPosts.id, body: communityPosts.body, gifUrl: communityPosts.gifUrl, hasMedia: sql<boolean>`${communityPosts.mediaKey} is not null`, mediaType: communityPosts.mediaType, createdAt: communityPosts.createdAt, userId: communityUsers.id, displayName: communityUsers.displayName, isAnonymous: communityPosts.isAnonymous, topicName: communityTopics.name })
      .from(communityPosts).innerJoin(communityUsers, eq(communityPosts.userId, communityUsers.id)).leftJoin(communityTopics, eq(communityPosts.topicId, communityTopics.id)).where(eq(communityPosts.status, "published")).orderBy(desc(communityPosts.createdAt)).limit(50);
    const ids = posts.map(post => post.id);
    if (!ids.length) return Response.json({ posts: [], viewerId: user.id });
    const placeholders = ids.map(() => "?").join(",");
    const db = env.DB;
    const commentsResult = await db.prepare(`SELECT c.id, c.post_id AS postId, c.body, c.created_at AS createdAt, u.id AS userId, u.display_name AS displayName FROM community_comments c JOIN community_users u ON u.id = c.user_id WHERE c.status = 'published' AND c.post_id IN (${placeholders}) ORDER BY c.created_at ASC`).bind(...ids).all();
    const reactionsResult = await db.prepare(`SELECT post_id AS postId, reaction, COUNT(*) AS count FROM community_reactions WHERE post_id IN (${placeholders}) GROUP BY post_id, reaction`).bind(...ids).all();
    const mineResult = await db.prepare(`SELECT post_id AS postId, reaction FROM community_reactions WHERE user_id = ? AND post_id IN (${placeholders})`).bind(user.id, ...ids).all();
    const shaped = posts.map(post => ({ ...post, userId: post.isAnonymous && post.userId !== user.id && user.role !== "moderator" ? null : post.userId, displayName: post.isAnonymous ? "Anonymous member" : post.displayName, canDelete: post.userId === user.id || user.role === "moderator", imageUrl: post.hasMedia ? `/api/community/media/${post.id}` : null, comments: commentsResult.results.filter((row: any) => row.postId === post.id), reactions: reactionsResult.results.filter((row: any) => row.postId === post.id), myReaction: (mineResult.results.find((row: any) => row.postId === post.id) as any)?.reaction ?? null }));
    return Response.json({ posts: shaped, viewerId: user.id });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ error: "The community feed is temporarily unavailable." }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    if (!await validSameOrigin(request)) return Response.json({ error: "Request could not be verified." }, { status: 403 });
    const user = await requireCommunityUser();
    await ensureD1AuthSchema();
    const userLimit = await takeAuthAttempt(request, "post", user.id);
    if (!userLimit.allowed) return Response.json({ error: "Too many posts in a short period. Try again later." }, { status: 429, headers: { "retry-after": String(userLimit.retryAfter) } });
    const data = await request.formData();
    const body = String(data.get("body") ?? "").trim();
    const gifUrl = String(data.get("gifUrl") ?? "").trim();
    const media = data.get("media");
    const topicId = String(data.get("topicId") ?? "").trim();
    const isAnonymous = data.get("anonymous") === "on";
    if (!body && !gifUrl && (!(media instanceof File) || media.size === 0)) return Response.json({ error: "Write something or add a photo or GIF." }, { status: 400 });
    if (body.length > 3000) return Response.json({ error: "Keep posts under 3,000 characters." }, { status: 400 });
    if (gifUrl && (!/^https:\/\/media\.giphy\.com\//.test(gifUrl) || gifUrl.length > 600)) return Response.json({ error: "Choose a GIF from the picker." }, { status: 400 });
    if (topicId && !/^[0-9a-f-]{36}$/i.test(topicId)) return Response.json({ error: "Choose a valid topic." }, { status: 400 });
    if (topicId) { const [topic] = await getDb().select({ id: communityTopics.id }).from(communityTopics).where(eq(communityTopics.id, topicId)).limit(1); if (!topic) return Response.json({ error: "That topic is no longer available." }, { status: 400 }); }
    if (media instanceof File && media.size > 0 && !await isSafeImage(media, MEDIA_TYPES, MAX_MEDIA_BYTES)) return Response.json({ error: "Upload a JPG, PNG, WebP, or GIF no larger than 10 MB." }, { status: 400 });
    const id = crypto.randomUUID();
    let mediaKey: string | null = null; let mediaType: string | null = null;
    if (media instanceof File && media.size > 0) {
      const ext = media.type === "image/png" ? "png" : media.type === "image/webp" ? "webp" : media.type === "image/gif" ? "gif" : "jpg";
      mediaKey = `community/${user.id}/${id}.${ext}`; mediaType = media.type;
      await env.BUCKET.put(mediaKey, stripImageMetadata(new Uint8Array(await media.arrayBuffer()), media.type), { httpMetadata: { contentType: media.type } });
    }
    await getDb().insert(communityPosts).values({ id, userId: user.id, body: body.slice(0, 3000), mediaKey, mediaType, gifUrl: gifUrl || null, topicId: topicId || null, isAnonymous, createdAt: new Date() });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) { if (error instanceof Response) return error; return Response.json({ error: "Your post could not be saved. Please try again." }, { status: 500 }); }
}
