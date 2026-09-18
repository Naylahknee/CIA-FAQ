import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const publicEventFields = "id,title,description,event_at,ends_at,location,experience_type,image_url,image_alt,source_url" as const;

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Calendar service is unavailable");
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}

export const listPublishedCalendarEvents = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("calendar_events").select(publicEventFields).eq("status", "published").gte("event_at", "2026-09-18T04:00:00.000Z").order("event_at");
  if (error) throw new Error(error.message);
  return data;
});

export const listCalendarDrafts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: allowed } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "moderator" });
    if (!allowed) throw new Error("Moderator access required");
    const { data, error } = await context.supabase.from("calendar_events").select("*").order("imported_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

const reviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["published", "rejected", "duplicate"]),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(3000).nullable(),
  eventAt: z.string().datetime(),
  location: z.string().trim().max(240).nullable(),
  experienceType: z.enum(["in_person", "virtual", "hybrid"]),
  imageAlt: z.string().trim().max(240).nullable(),
});

export const reviewCalendarDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => reviewSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "moderator" });
    if (!allowed) throw new Error("Moderator access required");
    const { error } = await context.supabase.from("calendar_events").update({
      status: data.status,
      title: data.title,
      description: data.description,
      event_at: data.eventAt,
      location: data.location,
      experience_type: data.experienceType,
      image_alt: data.imageAlt,
      reviewed_at: new Date().toISOString(),
      reviewed_by: context.userId,
      updated_at: new Date().toISOString(),
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
