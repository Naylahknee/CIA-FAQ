import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const postUrl = z.string().trim().url().max(300).refine((value) => /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+/.test(value), "Paste a link to a public Instagram post or reel.");

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}

export const listInstagramHighlights = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("instagram_highlights")
    .select("id,post_url,caption,posted_at,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6);
  if (error) return [];
  return data ?? [];
});

async function assertModerator(context: { supabase: ReturnType<typeof publicClient>; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "moderator" });
  if (!data) throw new Error("Moderator access is required.");
}

export const listAllInstagramHighlights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertModerator(context as never);
    const { data, error } = await context.supabase.from("instagram_highlights").select("id,post_url,caption,posted_at,sort_order,is_active,created_at").order("sort_order", { ascending: false }).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addInstagramHighlight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ postUrl, caption: z.string().trim().max(280).optional().nullable(), postedAt: z.string().trim().optional().nullable() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertModerator(context as never);
    const clean = data.postUrl.split("?")[0]!.replace(/\/$/, "");
    const { error } = await context.supabase.from("instagram_highlights").insert({
      post_url: clean,
      caption: data.caption?.trim() || null,
      posted_at: data.postedAt ? new Date(data.postedAt).toISOString() : new Date().toISOString(),
      sort_order: Math.floor(Date.now() / 1000),
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setInstagramHighlightActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), isActive: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertModerator(context as never);
    const { error } = await context.supabase.from("instagram_highlights").update({ is_active: data.isActive }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeInstagramHighlight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertModerator(context as never);
    const { error } = await context.supabase.from("instagram_highlights").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
