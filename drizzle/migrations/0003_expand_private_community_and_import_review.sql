ALTER TABLE public.profiles ADD COLUMN avatar_path text;
ALTER TABLE public.profiles ADD COLUMN bio text;
ALTER TABLE public.profiles ADD COLUMN member_status text NOT NULL DEFAULT 'active' CHECK (member_status IN ('pending','active','muted','banned'));
ALTER TABLE public.profiles ADD COLUMN joined_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.community_posts ADD COLUMN title text;
ALTER TABLE public.community_posts ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;
ALTER TABLE public.community_posts ADD COLUMN is_announcement boolean NOT NULL DEFAULT false;
ALTER TABLE public.community_posts ADD COLUMN link_url text;
ALTER TABLE public.community_posts ADD COLUMN edited_at timestamptz;
ALTER TABLE public.community_comments ADD COLUMN parent_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE;
ALTER TABLE public.community_comments ADD COLUMN edited_at timestamptz;
ALTER TABLE public.calendar_events ADD COLUMN import_notes text;
ALTER TABLE public.calendar_events ADD COLUMN parser_confidence numeric(4,3);

CREATE TABLE public.community_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','muted','banned')),
  invited_by uuid,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_memberships TO authenticated;
GRANT ALL ON public.community_memberships TO service_role;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read memberships" ON public.community_memberships FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'moderator'));
CREATE POLICY "Users request membership" ON public.community_memberships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Moderators manage memberships" ON public.community_memberships FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'moderator')) WITH CHECK (public.has_role(auth.uid(),'moderator'));
CREATE POLICY "Users withdraw pending membership" ON public.community_memberships FOR DELETE TO authenticated USING (user_id = auth.uid() AND status = 'pending');

CREATE OR REPLACE FUNCTION public.is_approved_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.community_memberships WHERE user_id = _user_id AND status = 'approved') OR public.has_role(_user_id,'moderator')
$$;
GRANT EXECUTE ON FUNCTION public.is_approved_member(uuid) TO authenticated;

CREATE TABLE public.community_post_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  storage_path text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image','video','file')),
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_post_media TO authenticated;
GRANT ALL ON public.community_post_media TO service_role;
ALTER TABLE public.community_post_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved members read post media" ON public.community_post_media FOR SELECT TO authenticated USING (public.is_approved_member(auth.uid()));
CREATE POLICY "Members add own post media" ON public.community_post_media FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND public.is_approved_member(auth.uid()));
CREATE POLICY "Owners manage post media" ON public.community_post_media FOR UPDATE TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'moderator')) WITH CHECK (user_id=auth.uid() OR public.has_role(auth.uid(),'moderator'));
CREATE POLICY "Owners delete post media" ON public.community_post_media FOR DELETE TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'moderator'));

CREATE TABLE public.community_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL UNIQUE REFERENCES public.community_posts(id) ON DELETE CASCADE,
  question text NOT NULL, allows_multiple boolean NOT NULL DEFAULT false, closes_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_polls TO authenticated; GRANT ALL ON public.community_polls TO service_role;
ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read polls" ON public.community_polls FOR SELECT TO authenticated USING (public.is_approved_member(auth.uid()));
CREATE POLICY "Authors create polls" ON public.community_polls FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.community_posts p WHERE p.id=post_id AND p.user_id=auth.uid()));
CREATE POLICY "Authors manage polls" ON public.community_polls FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.community_posts p WHERE p.id=post_id AND (p.user_id=auth.uid() OR public.has_role(auth.uid(),'moderator'))));
CREATE POLICY "Authors delete polls" ON public.community_polls FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.community_posts p WHERE p.id=post_id AND (p.user_id=auth.uid() OR public.has_role(auth.uid(),'moderator'))));

CREATE TABLE public.community_poll_options (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), poll_id uuid NOT NULL REFERENCES public.community_polls(id) ON DELETE CASCADE, label text NOT NULL, sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_poll_options TO authenticated; GRANT ALL ON public.community_poll_options TO service_role;
ALTER TABLE public.community_poll_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read poll options" ON public.community_poll_options FOR SELECT TO authenticated USING (public.is_approved_member(auth.uid()));
CREATE POLICY "Poll authors manage options" ON public.community_poll_options FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.community_polls q JOIN public.community_posts p ON p.id=q.post_id WHERE q.id=poll_id AND (p.user_id=auth.uid() OR public.has_role(auth.uid(),'moderator')))) WITH CHECK (EXISTS (SELECT 1 FROM public.community_polls q JOIN public.community_posts p ON p.id=q.post_id WHERE q.id=poll_id AND (p.user_id=auth.uid() OR public.has_role(auth.uid(),'moderator'))));

CREATE TABLE public.community_poll_votes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), option_id uuid NOT NULL REFERENCES public.community_poll_options(id) ON DELETE CASCADE, user_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(option_id,user_id)
);
GRANT SELECT, INSERT, DELETE ON public.community_poll_votes TO authenticated; GRANT ALL ON public.community_poll_votes TO service_role;
ALTER TABLE public.community_poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read poll votes" ON public.community_poll_votes FOR SELECT TO authenticated USING (public.is_approved_member(auth.uid()));
CREATE POLICY "Members vote" ON public.community_poll_votes FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND public.is_approved_member(auth.uid()));
CREATE POLICY "Members remove vote" ON public.community_poll_votes FOR DELETE TO authenticated USING (user_id=auth.uid());

CREATE TABLE public.community_event_rsvps (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE, user_id uuid NOT NULL, response text NOT NULL CHECK(response IN ('going','interested')), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(post_id,user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_event_rsvps TO authenticated; GRANT ALL ON public.community_event_rsvps TO service_role;
ALTER TABLE public.community_event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read RSVPs" ON public.community_event_rsvps FOR SELECT TO authenticated USING (public.is_approved_member(auth.uid()));
CREATE POLICY "Members RSVP" ON public.community_event_rsvps FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND public.is_approved_member(auth.uid()));
CREATE POLICY "Members update RSVP" ON public.community_event_rsvps FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE POLICY "Members remove RSVP" ON public.community_event_rsvps FOR DELETE TO authenticated USING (user_id=auth.uid());

CREATE TABLE public.community_notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, actor_id uuid, post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE, kind text NOT NULL, message text NOT NULL, read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_notifications TO authenticated; GRANT ALL ON public.community_notifications TO service_role;
ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.community_notifications FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY "Members create notifications" ON public.community_notifications FOR INSERT TO authenticated WITH CHECK(actor_id=auth.uid() AND public.is_approved_member(auth.uid()));
CREATE POLICY "Users update own notifications" ON public.community_notifications FOR UPDATE TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE POLICY "Users delete own notifications" ON public.community_notifications FOR DELETE TO authenticated USING(user_id=auth.uid());

CREATE TABLE public.community_albums (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, title text NOT NULL, description text, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_albums TO authenticated; GRANT ALL ON public.community_albums TO service_role;
ALTER TABLE public.community_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read albums" ON public.community_albums FOR SELECT TO authenticated USING(public.is_approved_member(auth.uid()));
CREATE POLICY "Members create albums" ON public.community_albums FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND public.is_approved_member(auth.uid()));
CREATE POLICY "Owners manage albums" ON public.community_albums FOR UPDATE TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'moderator')) WITH CHECK(user_id=auth.uid() OR public.has_role(auth.uid(),'moderator'));
CREATE POLICY "Owners delete albums" ON public.community_albums FOR DELETE TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'moderator'));

CREATE TABLE public.community_moderation_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), moderator_id uuid NOT NULL, action text NOT NULL, target_type text NOT NULL, target_id uuid, notes text, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.community_moderation_log TO authenticated; GRANT ALL ON public.community_moderation_log TO service_role;
ALTER TABLE public.community_moderation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Moderators read audit log" ON public.community_moderation_log FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'moderator'));
CREATE POLICY "Moderators add audit log" ON public.community_moderation_log FOR INSERT TO authenticated WITH CHECK(moderator_id=auth.uid() AND public.has_role(auth.uid(),'moderator'));

CREATE TABLE public.instagram_import_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz, status text NOT NULL DEFAULT 'running' CHECK(status IN ('running','complete','failed','blocked')), imported_count integer NOT NULL DEFAULT 0, skipped_count integer NOT NULL DEFAULT 0, error_message text
);
GRANT SELECT ON public.instagram_import_runs TO authenticated; GRANT ALL ON public.instagram_import_runs TO service_role;
ALTER TABLE public.instagram_import_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Moderators read import history" ON public.instagram_import_runs FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'moderator'));

CREATE INDEX community_memberships_status_idx ON public.community_memberships(status,created_at);
CREATE INDEX community_post_media_post_idx ON public.community_post_media(post_id,sort_order);
CREATE INDEX community_comments_parent_idx ON public.community_comments(parent_id,created_at);
CREATE INDEX community_notifications_user_idx ON public.community_notifications(user_id,read_at,created_at DESC);
CREATE INDEX community_posts_pinned_idx ON public.community_posts(is_pinned DESC,is_announcement DESC,created_at DESC);
CREATE INDEX instagram_import_runs_started_idx ON public.instagram_import_runs(started_at DESC);