-- CarSafe — Reseller Role Migrations
-- File: supabase/migrate_reseller.sql
-- Run AFTER migrate.sql, policies.sql, and migrate_dealer.sql are applied.
-- Safe to re-run: IF NOT EXISTS / DO $$ guards throughout.
-- Paste the entire file into Supabase Dashboard → SQL Editor → New query.

-- ─── 1. reseller_profiles ─────────────────────────────────────────────────────
-- One profile per reseller user.
-- user_id   → one profile per login identity
-- contact_email → no two profiles share the same contact email

CREATE TABLE IF NOT EXISTS public.reseller_profiles (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT        NOT NULL,
  company_name  TEXT        NOT NULL,
  contact_email TEXT        NOT NULL,
  contact_number TEXT       NOT NULL,
  address       TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reseller_profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT reseller_profiles_email_key   UNIQUE (contact_email)
);

-- ─── 2. RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE public.reseller_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reseller_profiles' AND policyname = 'anon_select_reseller_profiles'
  ) THEN
    CREATE POLICY anon_select_reseller_profiles ON public.reseller_profiles
      FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reseller_profiles' AND policyname = 'anon_insert_reseller_profiles'
  ) THEN
    CREATE POLICY anon_insert_reseller_profiles ON public.reseller_profiles
      FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reseller_profiles' AND policyname = 'anon_update_reseller_profiles'
  ) THEN
    CREATE POLICY anon_update_reseller_profiles ON public.reseller_profiles
      FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
