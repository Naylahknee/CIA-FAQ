CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_media_id text UNIQUE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 180),
  description text,
  event_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  experience_type text NOT NULL DEFAULT 'in_person' CHECK (experience_type IN ('in_person','virtual','hybrid')),
  image_url text,
  image_alt text,
  source_url text,
  source_caption text,
  source_published_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','published','rejected','duplicate')),
  imported_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.calendar_events TO anon;
GRANT SELECT, INSERT, UPDATE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published future calendar events" ON public.calendar_events FOR SELECT TO anon USING (status = 'published' AND event_at >= '2026-09-18T00:00:00-04:00'::timestamptz);
CREATE POLICY "Members read published calendar events" ON public.calendar_events FOR SELECT TO authenticated USING (status = 'published' OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Moderators create calendar drafts" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Moderators review calendar drafts" ON public.calendar_events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'moderator')) WITH CHECK (public.has_role(auth.uid(), 'moderator'));
CREATE INDEX calendar_events_public_idx ON public.calendar_events(status, event_at);
CREATE INDEX calendar_events_import_idx ON public.calendar_events(instagram_media_id, imported_at DESC);