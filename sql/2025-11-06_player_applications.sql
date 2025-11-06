DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('shortlist', 'not_considered');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.player_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  q1 text NOT NULL,
  q2 text NOT NULL,
  q3 text NOT NULL,
  q4 text NOT NULL,
  q5 text NOT NULL,
  status application_status NOT NULL DEFAULT 'shortlist',
  word_score integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS player_applications_user_idx ON public.player_applications (user_id);
