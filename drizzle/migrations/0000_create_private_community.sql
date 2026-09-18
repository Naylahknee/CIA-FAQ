CREATE TYPE public.app_role AS ENUM ('member', 'moderator');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 60),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'member',
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 3000),
  topic text,
  is_anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','removed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read published posts" ON public.community_posts FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "Members create own posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'published');
CREATE POLICY "Authors or moderators update posts" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Authors or moderators delete posts" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'moderator'));

CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 800),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','removed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_comments TO authenticated;
GRANT ALL ON public.community_comments TO service_role;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read published comments" ON public.community_comments FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "Members create own comments" ON public.community_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'published');
CREATE POLICY "Authors or moderators manage comments" ON public.community_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Authors or moderators delete comments" ON public.community_comments FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'moderator'));

CREATE TABLE public.faq_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question text NOT NULL CHECK (char_length(question) BETWEEN 4 AND 500),
  answer text,
  category text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','published','rejected','duplicate')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.faq_suggestions TO authenticated;
GRANT ALL ON public.faq_suggestions TO service_role;
ALTER TABLE public.faq_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own suggestions" ON public.faq_suggestions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Users submit pending suggestions" ON public.faq_suggestions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Moderators review suggestions" ON public.faq_suggestions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'moderator')) WITH CHECK (public.has_role(auth.uid(), 'moderator'));

CREATE INDEX community_posts_created_idx ON public.community_posts(created_at DESC);
CREATE INDEX community_comments_post_idx ON public.community_comments(post_id, created_at);
CREATE INDEX faq_suggestions_status_idx ON public.faq_suggestions(status, created_at);