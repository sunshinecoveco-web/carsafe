-- CarSafe RLS policies and explicit grants
-- Run this in the Supabase SQL Editor BEFORE seed.sql.
-- Required for Supabase security compliance (explicit GRANTs mandatory from Oct 2026).
--
-- PHASE NOTE: The app currently uses localStorage-based mock auth, not Supabase Auth.
-- The "anon read" policies below let the app work now.
-- When you migrate to Supabase Auth, remove the anon policies and uncomment
-- the auth.uid()-based policies in each section.

-- ─── Enable RLS on all tables ─────────────────────────────────────────────────

ALTER TABLE public.vehicles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;

-- ─── Explicit GRANTs (Supabase Oct 2026 compliance) ──────────────────────────

GRANT SELECT                    ON public.vehicles      TO anon, authenticated;
GRANT SELECT                    ON public.service_logs  TO anon, authenticated;
GRANT SELECT                    ON public.fuel_records  TO anon, authenticated;
GRANT SELECT                    ON public.activity_logs TO anon, authenticated;
GRANT SELECT                    ON public.dealers       TO anon, authenticated;
GRANT SELECT                    ON public.users         TO anon, authenticated;

-- Owners will need write access once writes are wired through Supabase:
GRANT INSERT, UPDATE, DELETE    ON public.vehicles      TO authenticated;
GRANT INSERT, UPDATE, DELETE    ON public.service_logs  TO authenticated;
GRANT INSERT, UPDATE, DELETE    ON public.fuel_records  TO authenticated;
GRANT INSERT, UPDATE, DELETE    ON public.activity_logs TO authenticated;

-- ─── vehicles ─────────────────────────────────────────────────────────────────

-- CURRENT: allow anon read (mock-auth phase)
CREATE POLICY "anon_read_vehicles"
  ON public.vehicles FOR SELECT TO anon
  USING (true);

-- FUTURE (Supabase Auth): replace the policy above with these:
-- CREATE POLICY "owners_read_own_vehicles"
--   ON public.vehicles FOR SELECT TO authenticated
--   USING (owner_id = auth.uid()::text);
-- CREATE POLICY "owners_update_own_vehicles"
--   ON public.vehicles FOR UPDATE TO authenticated
--   USING (owner_id = auth.uid()::text);
-- CREATE POLICY "owners_insert_vehicles"
--   ON public.vehicles FOR INSERT TO authenticated
--   WITH CHECK (owner_id = auth.uid()::text);

-- ─── service_logs ─────────────────────────────────────────────────────────────

-- CURRENT: allow anon read (mock-auth phase)
CREATE POLICY "anon_read_service_logs"
  ON public.service_logs FOR SELECT TO anon
  USING (true);

-- FUTURE (Supabase Auth):
-- CREATE POLICY "read_service_logs_for_own_vehicles"
--   ON public.service_logs FOR SELECT TO authenticated
--   USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE owner_id = auth.uid()::text));
-- CREATE POLICY "insert_service_logs_for_own_vehicles"
--   ON public.service_logs FOR INSERT TO authenticated
--   WITH CHECK (vehicle_id IN (SELECT id FROM public.vehicles WHERE owner_id = auth.uid()::text));

-- ─── fuel_records ─────────────────────────────────────────────────────────────

-- CURRENT: allow anon read (mock-auth phase)
CREATE POLICY "anon_read_fuel_records"
  ON public.fuel_records FOR SELECT TO anon
  USING (true);

-- FUTURE (Supabase Auth):
-- CREATE POLICY "read_fuel_records_for_own_vehicles"
--   ON public.fuel_records FOR SELECT TO authenticated
--   USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE owner_id = auth.uid()::text));

-- ─── activity_logs ────────────────────────────────────────────────────────────

-- CURRENT: allow anon read (mock-auth phase)
CREATE POLICY "anon_read_activity_logs"
  ON public.activity_logs FOR SELECT TO anon
  USING (true);

-- FUTURE (Supabase Auth):
-- CREATE POLICY "read_activity_logs_for_own_vehicles"
--   ON public.activity_logs FOR SELECT TO authenticated
--   USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE owner_id = auth.uid()::text));

-- ─── dealers ──────────────────────────────────────────────────────────────────

-- Dealers are a public reference table — all roles can read.
CREATE POLICY "public_read_dealers"
  ON public.dealers FOR SELECT
  USING (true);

-- ─── users ────────────────────────────────────────────────────────────────────

-- CURRENT: allow anon read (mock-auth phase)
CREATE POLICY "anon_read_users"
  ON public.users FOR SELECT TO anon
  USING (true);

-- FUTURE (Supabase Auth):
-- CREATE POLICY "users_read_own_profile"
--   ON public.users FOR SELECT TO authenticated
--   USING (id = auth.uid()::text);
-- CREATE POLICY "users_update_own_profile"
--   ON public.users FOR UPDATE TO authenticated
--   USING (id = auth.uid()::text);
