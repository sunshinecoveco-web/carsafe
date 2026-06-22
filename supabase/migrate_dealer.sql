-- CarSafe — Dealer Role Migrations
-- File: supabase/migrate_dealer.sql
-- Run AFTER migrate.sql and policies.sql are already applied.
-- Safe to re-run: IF NOT EXISTS / DO $$ guards throughout.
-- Paste the entire file into Supabase Dashboard → SQL Editor → New query.

-- ─── 1. dealer_profiles ───────────────────────────────────────────────────────
-- One profile per dealer user. Three unique constraints enforce no-duplicate
-- rules at the DB level:
--   • user_id          → one profile per login identity (skips creation form on re-login)
--   • registration_number → no two dealers can claim the same business registration
--   • contact_email    → no two profiles can share the same business contact email
--
-- user_id is TEXT (not UUID) to match the current localStorage mock auth.
-- When Supabase Auth lands, populate with auth.uid()::text — constraint still works.

CREATE TABLE IF NOT EXISTS public.dealer_profiles (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             TEXT        NOT NULL,
  dealership_name     TEXT        NOT NULL,
  registration_number TEXT        NOT NULL,
  address             TEXT        NOT NULL,
  contact_number      TEXT        NOT NULL,
  contact_email       TEXT        NOT NULL,
  is_verified         BOOLEAN     NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dealer_profiles_user_id_key    UNIQUE (user_id),
  CONSTRAINT dealer_profiles_reg_number_key UNIQUE (registration_number),
  CONSTRAINT dealer_profiles_email_key      UNIQUE (contact_email)
);

-- ─── 2. dealer_vehicle_links ──────────────────────────────────────────────────
-- Junction table: records which dealers are linked to which vehicles.
-- Used for both PATH A (link to existing vehicle) and PATH B (dealer-created vehicle).
-- UNIQUE (dealer_id, vehicle_id) blocks duplicate link attempts — the app catches
-- the constraint violation and shows a friendly "already linked" message.

CREATE TABLE IF NOT EXISTS public.dealer_vehicle_links (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id  UUID        NOT NULL REFERENCES public.dealer_profiles(id) ON DELETE CASCADE,
  vehicle_id UUID        NOT NULL REFERENCES public.vehicles(id)        ON DELETE CASCADE,
  linked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dealer_vehicle_links_unique UNIQUE (dealer_id, vehicle_id)
);

-- ─── 3. vehicles — new columns + uniqueness ───────────────────────────────────
-- condition:    physical state set by dealer (e.g. 'Excellent', 'Good', 'Fair', 'Poor')
-- asking_price: dealer listing price; NULL for owner-only vehicles
-- photos:       JSONB array of {url, label} for vehicle gallery
--               (existing image_url column stays as the primary thumbnail)

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS condition    TEXT,
  ADD COLUMN IF NOT EXISTS asking_price NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS photos       JSONB NOT NULL DEFAULT '[]';

-- UNIQUE on registration_number — prevents duplicate vehicles by reg plate.
-- The DO block is idempotent: skips silently if the constraint already exists.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.vehicles'::regclass
      AND conname   = 'vehicles_registration_number_key'
  ) THEN
    ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_registration_number_key UNIQUE (registration_number);
  END IF;
END $$;

-- UNIQUE on vin — prevents duplicate vehicles by VIN.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.vehicles'::regclass
      AND conname   = 'vehicles_vin_key'
  ) THEN
    ALTER TABLE public.vehicles
      ADD CONSTRAINT vehicles_vin_key UNIQUE (vin);
  END IF;
END $$;

-- ─── 4. service_logs — dealer columns + duplicate guard ──────────────────────
-- dealer_id:          which dealer stamped this record; NULL = owner-added entry
-- mileage_at_service: odometer reading at time of service (distinct from current mileage)
-- labour_cost:        labour component of the bill; existing `cost` column = total cost
--
-- serviced_by already exists and maps to technician name — no new column needed.

ALTER TABLE public.service_logs
  ADD COLUMN IF NOT EXISTS dealer_id          UUID REFERENCES public.dealer_profiles(id),
  ADD COLUMN IF NOT EXISTS mileage_at_service INTEGER,
  ADD COLUMN IF NOT EXISTS labour_cost        NUMERIC(10, 2);

-- Partial unique index: duplicate guard for dealer-submitted records only.
-- Blocks: same dealer + same vehicle + same date + same category submitted twice.
-- NULL dealer_id rows (owner-added) are excluded — owners can enter freely.
CREATE UNIQUE INDEX IF NOT EXISTS service_logs_dealer_dup_idx
  ON public.service_logs (vehicle_id, service_date, category, dealer_id)
  WHERE dealer_id IS NOT NULL;

-- ─── 5. RLS — enable, grants, policies ───────────────────────────────────────

ALTER TABLE public.dealer_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_vehicle_links ENABLE ROW LEVEL SECURITY;

-- Grants: anon = current mock auth role; authenticated = future Supabase Auth role
GRANT SELECT, INSERT, UPDATE ON public.dealer_profiles      TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.dealer_vehicle_links TO anon, authenticated;

-- service_logs was only granted to `authenticated` for writes in policies.sql.
-- Add anon grants so mock-auth dealer sessions can insert/update records.
GRANT INSERT, UPDATE ON public.service_logs TO anon;

-- ── dealer_profiles ──
DROP POLICY IF EXISTS "anon_read_dealer_profiles"   ON public.dealer_profiles;
CREATE POLICY "anon_read_dealer_profiles"
  ON public.dealer_profiles FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "anon_insert_dealer_profiles" ON public.dealer_profiles;
CREATE POLICY "anon_insert_dealer_profiles"
  ON public.dealer_profiles FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_dealer_profiles" ON public.dealer_profiles;
CREATE POLICY "anon_update_dealer_profiles"
  ON public.dealer_profiles FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- ── dealer_vehicle_links ──
DROP POLICY IF EXISTS "anon_read_dealer_vehicle_links"   ON public.dealer_vehicle_links;
CREATE POLICY "anon_read_dealer_vehicle_links"
  ON public.dealer_vehicle_links FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "anon_insert_dealer_vehicle_links" ON public.dealer_vehicle_links;
CREATE POLICY "anon_insert_dealer_vehicle_links"
  ON public.dealer_vehicle_links FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_dealer_vehicle_links" ON public.dealer_vehicle_links;
CREATE POLICY "anon_delete_dealer_vehicle_links"
  ON public.dealer_vehicle_links FOR DELETE TO anon
  USING (true);

-- ── service_logs write policies (dealer inserts / updates) ──
DROP POLICY IF EXISTS "anon_insert_service_logs" ON public.service_logs;
CREATE POLICY "anon_insert_service_logs"
  ON public.service_logs FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_service_logs" ON public.service_logs;
CREATE POLICY "anon_update_service_logs"
  ON public.service_logs FOR UPDATE TO anon
  USING (true) WITH CHECK (true);
