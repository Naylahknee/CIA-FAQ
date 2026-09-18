import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const runInstagramImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: allowed } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "moderator" });
    if (!allowed) throw new Error("Moderator access required");
    const { importInstagramEvents } = await import("./instagram-import.server");
    return importInstagramEvents();
  });

export const listInstagramImportRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: allowed } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "moderator" });
    if (!allowed) throw new Error("Moderator access required");
    const { data, error } = await context.supabase.from("instagram_import_runs").select("*").order("started_at", { ascending: false }).limit(20);
    if (error) throw new Error(error.message);
    return data;
  });