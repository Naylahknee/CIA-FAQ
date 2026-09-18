import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const POST_WINDOW_MINUTES = 10;
const MAX_POSTS_PER_WINDOW = 5;
const MAX_COMMENTS_PER_WINDOW = 15;

function linkCount(text: string) {
  return (text.match(/https?:\/\/|www\./gi) ?? []).length;
}

/** Returns a reason when the text looks like spam, otherwise null. */
function spamReason(text: string) {
  const trimmed = text.trim();
  if (trimmed.length < 5) return "Too short to review";
  if (linkCount(trimmed) > 2) return "Contains several links";
  const letters = trimmed.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 20 && letters === letters.toUpperCase()) return "Written in all capitals";
  if (/\b(free money|crypto|casino|viagra|work from home|click here now|telegram\.me|bit\.ly)\b/i.test(trimmed)) return "Matches a known spam pattern";
  if (/(.)\1{9,}/.test(trimmed)) return "Repeated characters";
  return null;
}

/**
 * Creates the member profile and approves the account so a new parent lands
 * directly in the feed. Returns the membership status.
 */
export const joinCommunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ displayName: z.string().trim().min(1).max(80).optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = String(context.claims?.["email"] ?? "");
    const displayName = data.displayName?.trim() || email.split("@")[0] || "Family member";

    const { data: existingProfile } = await supabaseAdmin.from("profiles").select("id,display_name").eq("id", context.userId).maybeSingle();
    if (!existingProfile) {
      await supabaseAdmin.from("profiles").insert({ id: context.userId, display_name: displayName, member_status: "active" });
    } else {
      await supabaseAdmin.from("profiles").update({ member_status: "active" }).eq("id", context.userId);
    }

    const { data: membership } = await supabaseAdmin.from("community_memberships").select("id,status").eq("user_id", context.userId).maybeSingle();
    if (!membership) {
      await supabaseAdmin.from("community_memberships").insert({ user_id: context.userId, status: "approved", reviewed_at: new Date().toISOString() });
      return { status: "approved" as const };
    }
    if (membership.status === "banned" || membership.status === "muted") return { status: membership.status };
    if (membership.status !== "approved") {
      await supabaseAdmin.from("community_memberships").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", membership.id);
    }
    return { status: "approved" as const };
  });

const postSchema = z.object({
  body: z.string().trim().min(1).max(3000),
  title: z.string().trim().max(180).nullable().optional(),
  topic: z.string().trim().max(50).nullable().optional(),
  postType: z.enum(["discussion", "question", "resource", "event"]).default("discussion"),
  isAnonymous: z.boolean().default(false),
  isAnnouncement: z.boolean().default(false),
  eventAt: z.string().datetime().nullable().optional(),
});

/** Publishes a member post, or holds it for moderator review when it looks like spam. */
export const submitCommunityPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => postSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: approved } = await context.supabase.rpc("is_approved_member", { _user_id: context.userId });
    if (!approved) throw new Error("Approved community membership is required");
    const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    const isModerator = roles?.some((row) => row.role === "moderator") ?? false;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - POST_WINDOW_MINUTES * 60_000).toISOString();
    const { count } = await supabaseAdmin.from("community_posts").select("id", { count: "exact", head: true }).eq("user_id", context.userId).gte("created_at", since);
    if (!isModerator && (count ?? 0) >= MAX_POSTS_PER_WINDOW) {
      return { status: "rate_limited" as const, message: `You have posted ${MAX_POSTS_PER_WINDOW} times in the last ${POST_WINDOW_MINUTES} minutes. Try again shortly.`, postId: null };
    }

    const { data: duplicate } = await supabaseAdmin.from("community_posts").select("id").eq("user_id", context.userId).eq("body", data.body).gte("created_at", new Date(Date.now() - 86_400_000).toISOString()).maybeSingle();
    if (duplicate) return { status: "duplicate" as const, message: "You already shared this in the last day.", postId: null };

    const reason = isModerator ? null : spamReason(data.body);
    const status = reason ? "pending" : "published";
    const { data: inserted, error } = await supabaseAdmin.from("community_posts").insert({
      user_id: context.userId,
      body: data.body,
      title: data.title ?? null,
      topic: data.topic ?? null,
      post_type: data.postType,
      is_anonymous: data.isAnonymous,
      is_announcement: isModerator && data.isAnnouncement,
      event_at: data.eventAt ?? null,
      status,
    }).select("id").single();
    if (error) throw new Error(error.message);
    return {
      status: status === "published" ? ("published" as const) : ("held" as const),
      message: status === "published" ? "" : `Sent to a moderator for review (${reason}).`,
      postId: inserted.id,
    };
  });

/** Adds a comment, holding likely spam for moderator review. */
export const submitCommunityComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ postId: z.string().uuid(), parentId: z.string().uuid().nullable().optional(), body: z.string().trim().min(1).max(800) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: approved } = await context.supabase.rpc("is_approved_member", { _user_id: context.userId });
    if (!approved) throw new Error("Approved community membership is required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - POST_WINDOW_MINUTES * 60_000).toISOString();
    const { count } = await supabaseAdmin.from("community_comments").select("id", { count: "exact", head: true }).eq("user_id", context.userId).gte("created_at", since);
    if ((count ?? 0) >= MAX_COMMENTS_PER_WINDOW) return { status: "rate_limited" as const, message: "You are commenting very quickly. Try again in a few minutes." };
    const reason = spamReason(data.body);
    const { error } = await supabaseAdmin.from("community_comments").insert({
      post_id: data.postId,
      parent_id: data.parentId ?? null,
      user_id: context.userId,
      body: data.body,
      status: reason ? "pending" : "published",
    });
    if (error) throw new Error(error.message);
    return reason ? { status: "held" as const, message: `Your comment is with a moderator (${reason}).` } : { status: "published" as const, message: "" };
  });

/** Moderator decision on a held post. */
export const reviewCommunityPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ postId: z.string().uuid(), decision: z.enum(["published", "removed"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isModerator } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "moderator" });
    if (!isModerator) throw new Error("Moderator access required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("community_posts").update({ status: data.decision }).eq("id", data.postId);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("community_moderation_log").insert({ moderator_id: context.userId, action: data.decision === "published" ? "approve_post" : "remove_post", target_type: "community_post", target_id: data.postId });
    return { ok: true };
  });

/** Posts waiting for moderator review. */
export const listHeldCommunityPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isModerator } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "moderator" });
    if (!isModerator) throw new Error("Moderator access required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("community_posts").select("id,body,title,topic,created_at,user_id").eq("status", "pending").order("created_at", { ascending: false }).limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
