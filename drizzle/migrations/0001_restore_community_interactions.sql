ALTER TABLE public.community_posts ADD COLUMN media_url text;
ALTER TABLE public.community_posts ADD COLUMN media_type text CHECK (media_type IS NULL OR media_type IN ('image','file','gif'));
ALTER TABLE public.community_posts ADD COLUMN post_type text NOT NULL DEFAULT 'discussion' CHECK (post_type IN ('discussion','question','resource','event'));
ALTER TABLE public.community_posts ADD COLUMN event_at timestamptz;

CREATE TABLE public.community_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction text NOT NULL DEFAULT 'helpful' CHECK (reaction IN ('helpful','support','celebrate')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, reaction)
);
GRANT SELECT, INSERT, DELETE ON public.community_reactions TO authenticated;
GRANT ALL ON public.community_reactions TO service_role;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read reactions" ON public.community_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members add own reactions" ON public.community_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members remove own reactions" ON public.community_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.community_saved_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.community_saved_posts TO authenticated;
GRANT ALL ON public.community_saved_posts TO service_role;
ALTER TABLE public.community_saved_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own saved posts" ON public.community_saved_posts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users save posts" ON public.community_saved_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unsave posts" ON public.community_saved_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 4 AND 500),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.community_reports TO authenticated;
GRANT ALL ON public.community_reports TO service_role;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own reports" ON public.community_reports FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Users report posts" ON public.community_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Moderators review reports" ON public.community_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'moderator')) WITH CHECK (public.has_role(auth.uid(), 'moderator'));

CREATE INDEX community_reactions_post_idx ON public.community_reactions(post_id);
CREATE INDEX community_saved_posts_user_idx ON public.community_saved_posts(user_id);
CREATE INDEX community_reports_status_idx ON public.community_reports(status, created_at);