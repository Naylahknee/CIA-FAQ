ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location text;

CREATE TABLE public.family_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text,
  program text,
  class_year text,
  start_term text,
  housing text,
  dietary_notes text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_students TO authenticated;
GRANT ALL ON public.family_students TO service_role;

ALTER TABLE public.family_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents read own students" ON public.family_students FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "Parents insert own students" ON public.family_students FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents update own students" ON public.family_students FOR UPDATE TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents delete own students" ON public.family_students FOR DELETE TO authenticated USING (auth.uid() = parent_id);

CREATE INDEX family_students_parent_id_idx ON public.family_students (parent_id);