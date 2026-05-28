-- CarSafe schema migration — run BEFORE seed.sql
-- Safe to re-run: ADD COLUMN IF NOT EXISTS, CREATE TABLE IF NOT EXISTS.

-- ─── vehicles: add missing columns ───────────────────────────────────────────

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS image_hint                  TEXT,
  ADD COLUMN IF NOT EXISTS insurance_provider          TEXT,
  ADD COLUMN IF NOT EXISTS insurance_policy_number     TEXT,
  ADD COLUMN IF NOT EXISTS insurance_coverage          TEXT,
  ADD COLUMN IF NOT EXISTS insurance_expires           TEXT,
  ADD COLUMN IF NOT EXISTS approved_dealer_ids         TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS approved_reseller_ids       TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS approved_insurance_ids      TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS allow_dealer_service_access BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_reseller_access       BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_insurance_access      BOOLEAN DEFAULT false;

-- ─── service_logs: add missing columns ────────────────────────────────────────
-- Note: "workshop" column already exists and maps to servicedBy in the app.
-- "parts" already exists as TEXT (stores JSON string).

ALTER TABLE public.service_logs
  ADD COLUMN IF NOT EXISTS notes       TEXT  DEFAULT '',
  ADD COLUMN IF NOT EXISTS category    TEXT,
  ADD COLUMN IF NOT EXISTS invoice_url TEXT,
  ADD COLUMN IF NOT EXISTS photos      JSONB DEFAULT '[]';

-- ─── dealers: add missing column ──────────────────────────────────────────────

ALTER TABLE public.dealers
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- ─── fuel_records: new table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.fuel_records (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID          NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  fuel_date  DATE          NOT NULL,
  amount     NUMERIC(8,2)  NOT NULL,
  cost       NUMERIC(10,2) NOT NULL,
  odometer   INTEGER       NOT NULL,
  created_at TIMESTAMPTZ   DEFAULT now()
);

-- ─── activity_logs: new table ─────────────────────────────────────────────────
-- user_id is TEXT (not UUID) because mock-auth IDs are strings like 'dealer-1'.

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id    UUID        NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  occurred_at   TIMESTAMPTZ NOT NULL,
  user_id       TEXT        NOT NULL,
  action        TEXT        NOT NULL,
  details       TEXT,
  hash          TEXT,
  previous_hash TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
