-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid,
  sender_id uuid,
  receiver_id uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT connections_pkey PRIMARY KEY (id),
  CONSTRAINT connections_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT connections_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id),
  CONSTRAINT connections_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.event_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  event_id uuid,
  question1 text,
  question2 text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT event_answers_pkey PRIMARY KEY (id),
  CONSTRAINT event_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT event_answers_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.event_attendees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid,
  user_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT event_attendees_pkey PRIMARY KEY (id),
  CONSTRAINT event_attendees_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_attendees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date,
  location text,
  code_4digit character varying NOT NULL,
  qr_url text,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'over'::text, 'deleted'::text])),
  created_by uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid,
  user_id uuid,
  match_user_id uuid,
  why_meet text,
  things_in_common text,
  dive_deeper text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT matches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT matches_match_user_id_fkey FOREIGN KEY (match_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  job_title text,
  company text,
  bio text,
  location text,
  interests text,
  enneagram text,
  mbti text,
  allow_different_profiles boolean DEFAULT false,
  profile_pic text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.recaps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid,
  user_id uuid,
  q1_goals_met boolean,
  q2_repeat boolean,
  q3_business_opportunities boolean,
  recap_url text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT recaps_pkey PRIMARY KEY (id),
  CONSTRAINT recaps_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT recaps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL,
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text])),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);