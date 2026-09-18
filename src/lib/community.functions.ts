import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]),
});

export const createCommunityUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => uploadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: approved } = await context.supabase.rpc("is_approved_member", { _user_id: context.userId });
    if (!approved) throw new Error("Approved community membership is required");
    const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100);
    const path = `${context.userId}/${crypto.randomUUID()}-${safeName}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage.from("community-media").createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: signed.token, contentType: data.contentType };
  });

export const signCommunityMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ paths: z.array(z.string().min(1)).max(100) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: approved } = await context.supabase.rpc("is_approved_member", { _user_id: context.userId });
    if (!approved) throw new Error("Approved community membership is required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage.from("community-media").createSignedUrls(data.paths, 3600);
    if (error) throw new Error(error.message);
    return Object.fromEntries(signed.map((item) => [item.path ?? "", item.signedUrl]));
  });