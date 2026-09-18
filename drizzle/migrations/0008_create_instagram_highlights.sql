CREATE TABLE public.instagram_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_url text NOT NULL,
  caption text,
  posted_at timestamp with time zone,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.instagram_highlights TO authenticated;
GRANT SELECT ON public.instagram_highlights TO anon;
GRANT ALL ON public.instagram_highlights TO service_role;

ALTER TABLE public.instagram_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active highlights" ON public.instagram_highlights FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Moderators read all highlights" ON public.instagram_highlights FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Moderators insert highlights" ON public.instagram_highlights FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Moderators update highlights" ON public.instagram_highlights FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'moderator')) WITH CHECK (public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Moderators delete highlights" ON public.instagram_highlights FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'moderator'));

CREATE INDEX instagram_highlights_active_idx ON public.instagram_highlights (is_active, sort_order DESC, created_at DESC);