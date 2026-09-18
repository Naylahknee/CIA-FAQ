type InstagramMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
};

const NAMED_DATE_PATTERN = /(?:sept(?:ember)?|sep)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*(2026|2027))?/i;
const NUMERIC_DATE_PATTERN = /(\d{1,2})[/-](\d{1,2})[/-](2026|2027)/;

function parseCandidate(media: InstagramMedia) {
  const caption = media.caption?.trim() ?? "";
  let date: Date | null = null;
  const named = caption.match(NAMED_DATE_PATTERN);
  if (named) date = new Date(Number(named[2] ?? 2026), 8, Number(named[1]), 12);
  const numeric = caption.match(NUMERIC_DATE_PATTERN);
  if (!date && numeric) date = new Date(Number(numeric[3]), Number(numeric[1]) - 1, Number(numeric[2]), 12);
  if (!date || Number.isNaN(date.getTime())) return null;
  const firstLine = caption.split("\n").map((line) => line.trim()).find(Boolean) ?? "CIA Activities event";
  return {
    instagram_media_id: media.id,
    title: firstLine.slice(0, 180),
    description: caption.slice(0, 3000) || null,
    event_at: date.toISOString(),
    image_url: media.media_type === "IMAGE" || media.media_type === "CAROUSEL_ALBUM" ? media.media_url ?? null : null,
    image_alt: `${firstLine.slice(0, 150)} event image from CIA Activities`,
    source_url: media.permalink ?? null,
    source_caption: caption || null,
    source_published_at: media.timestamp ?? null,
    status: "pending" as const,
    import_notes: "Date detected automatically. Confirm time, location, and wording before publishing.",
    parser_confidence: 0.55,
  };
}

export async function importInstagramEvents() {
  const accessToken = process.env["INSTAGRAM_ACCESS_TOKEN"];
  const accountId = process.env["INSTAGRAM_ACCOUNT_ID"];
  if (!accessToken || !accountId) return { configured: false, imported: 0, skipped: 0, message: "Official Instagram authorization has not been connected." };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: run, error: runError } = await supabaseAdmin.from("instagram_import_runs").insert({ status: "running" }).select("id").single();
  if (runError) throw new Error(runError.message);
  try {
    const url = new URL(`https://graph.facebook.com/v21.0/${accountId}/media`);
    url.searchParams.set("fields", "id,caption,media_type,media_url,permalink,timestamp");
    url.searchParams.set("limit", "50");
    url.searchParams.set("access_token", accessToken);
    const response = await fetch(url);
    const body = await response.text();
    if (!response.ok) throw new Error(`Instagram request failed [${response.status}]: ${body}`);
    const payload = JSON.parse(body) as { data?: InstagramMedia[] };
    const candidates = (payload.data ?? []).map(parseCandidate).filter((item) => item !== null);
    let imported = 0;
    for (const candidate of candidates) {
      const { error } = await supabaseAdmin.from("calendar_events").upsert(candidate, { onConflict: "instagram_media_id", ignoreDuplicates: true });
      if (!error) imported += 1;
    }
    await supabaseAdmin.from("instagram_import_runs").update({ status: "complete", completed_at: new Date().toISOString(), imported_count: imported, skipped_count: (payload.data?.length ?? 0) - imported }).eq("id", run.id);
    return { configured: true, imported, skipped: (payload.data?.length ?? 0) - imported, message: "Import complete." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Instagram import failed";
    await supabaseAdmin.from("instagram_import_runs").update({ status: "failed", completed_at: new Date().toISOString(), error_message: message }).eq("id", run.id);
    throw error;
  }
}