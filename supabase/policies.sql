-- CarSafe RLS policies and explicit grants
-- Run this in the Supabase SQL Editor.
-- Idempotent: safe to re-run; existing policies are dropped and recreated.
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
ALTER TABLE public.vehicle_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;

-- ─── Explicit GRANTs (Supabase Oct 2026 compliance) ──────────────────────────

GRANT SELECT                    ON public.vehicles      TO anon, authenticated;
GRANT SELECT                    ON public.service_logs  TO anon, authenticated;
GRANT SELECT                    ON public.fuel_records  TO anon, authenticated;
GRANT SELECT                    ON public.activity_logs TO anon, authenticated;
GRANT SELECT                    ON public.vehicle_flags TO anon, authenticated;
GRANT SELECT                    ON public.dealers       TO anon, authenticated;
GRANT SELECT                    ON public.users         TO anon, authenticated;

-- Owners will need write access once writes are wired through Supabase:
GRANT INSERT, UPDATE, DELETE    ON public.vehicles      TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE    ON public.service_logs  TO authenticated;
GRANT INSERT, UPDATE, DELETE    ON public.fuel_records  TO authenticated;
GRANT INSERT, UPDATE, DELETE    ON public.activity_logs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE    ON public.vehicle_flags TO anon, authenticated;

-- ─── vehicles ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_read_vehicles" ON public.vehicles;
CREATE POLICY "anon_read_vehicles"
  ON public.vehicles FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "anon_insert_vehicles" ON public.vehicles;
CREATE POLICY "anon_insert_vehicles"
  ON public.vehicles FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_vehicles" ON public.vehicles;
CREATE POLICY "anon_update_vehicles"
  ON public.vehicles FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- FUTURE (Supabase Auth): replace the policies above with these:
-- DROP POLICY IF EXISTS "owners_read_own_vehicles" ON public.vehicles;
-- CREATE POLICY "owners_read_own_vehicles"
--   ON public.vehicles FOR SELECT TO authenticated
--   USING (owner_id = auth.uid()::text);
-- DROP POLICY IF EXISTS "owners_update_own_vehicles" ON public.vehicles;
-- CREATE POLICY "owners_update_own_vehicles"
--   ON public.vehicles FOR UPDATE TO authenticated
--   USING (owner_id = auth.uid()::text);
-- DROP POLICY IF EXISTS "owners_insert_vehicles" ON public.vehicles;
-- CREATE POLICY "owners_insert_vehicles"
--   ON public.vehicles FOR INSERT TO authenticated
--   WITH CHECK (owner_id = auth.uid()::text);

-- ─── service_logs ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_read_service_logs" ON public.service_logs;
CREATE POLICY "anon_read_service_logs"
  ON public.service_logs FOR SELECT TO anon
  USING (true);

-- FUTURE (Supabase Auth):
-- DROP POLICY IF EXISTS "read_service_logs_for_own_vehicles" ON public.service_logs;
-- CREATE POLICY "read_service_logs_for_own_vehicles"
--   ON public.service_logs FOR SELECT TO authenticated
--   USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE owner_id = auth.uid()::text));
-- DROP POLICY IF EXISTS "insert_service_logs_for_own_vehicles" ON public.service_logs;
-- CREATE POLICY "insert_service_logs_for_own_vehicles"
--   ON public.service_logs FOR INSERT TO authenticated
--   WITH CHECK (vehicle_id IN (SELECT id FROM public.vehicles WHERE owner_id = auth.uid()::text));

-- ─── fuel_records ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_read_fuel_records" ON public.fuel_records;
CREATE POLICY "anon_read_fuel_records"
  ON public.fuel_records FOR SELECT TO anon
  USING (true);

-- FUTURE (Supabase Auth):
-- DROP POLICY IF EXISTS "read_fuel_records_for_own_vehicles" ON public.fuel_records;
-- CREATE POLICY "read_fuel_records_for_own_vehicles"
--   ON public.fuel_records FOR SELECT TO authenticated
--   USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE owner_id = auth.uid()::text));

-- ─── activity_logs ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_read_activity_logs" ON public.activity_logs;
CREATE POLICY "anon_read_activity_logs"
  ON public.activity_logs FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "anon_insert_activity_logs" ON public.activity_logs;
CREATE POLICY "anon_insert_activity_logs"
  ON public.activity_logs FOR INSERT TO anon
  WITH CHECK (true);

-- FUTURE (Supabase Auth):
-- DROP POLICY IF EXISTS "read_activity_logs_for_own_vehicles" ON public.activity_logs;
-- CREATE POLICY "read_activity_logs_for_own_vehicles"
--   ON public.activity_logs FOR SELECT TO authenticated
--   USING (vehicle_id IN (SELECT id FROM public.vehicles WHERE owner_id = auth.uid()::text));

-- ─── vehicle_flags ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_read_vehicle_flags" ON public.vehicle_flags;
CREATE POLICY "anon_read_vehicle_flags"
  ON public.vehicle_flags FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "anon_insert_vehicle_flags" ON public.vehicle_flags;
CREATE POLICY "anon_insert_vehicle_flags"
  ON public.vehicle_flags FOR INSERT TO anon
  WITH CHECK (true);

-- ─── dealers ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "public_read_dealers" ON public.dealers;
CREATE POLICY "public_read_dealers"
  ON public.dealers FOR SELECT
  USING (true);

-- ─── storage: licence-discs bucket ───────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'licence-discs',
  'licence-discs',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/heic']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "owners can upload licence discs"   ON storage.objects;
DROP POLICY IF EXISTS "owners can delete licence discs"   ON storage.objects;
DROP POLICY IF EXISTS "public can read licence discs"     ON storage.objects;

CREATE POLICY "owners can upload licence discs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'licence-discs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "owners can delete licence discs"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'licence-discs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "public can read licence discs"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'licence-discs');

-- ─── users ────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_read_users" ON public.users;
CREATE POLICY "anon_read_users"
  ON public.users FOR SELECT TO anon
  USING (true);

-- FUTURE (Supabase Auth):
-- DROP POLICY IF EXISTS "users_read_own_profile" ON public.users;
-- CREATE POLICY "users_read_own_profile"
--   ON public.users FOR SELECT TO authenticated
--   USING (id = auth.uid()::text);
-- DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;
-- CREATE POLICY "users_update_own_profile"
--   ON public.users FOR UPDATE TO authenticated
--   USING (id = auth.uid()::text);
