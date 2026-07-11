-- Insurer add vehicle flow support.
-- Creates vehicle_policies if it does not exist and adds the expected columns.

CREATE TABLE IF NOT EXISTS public.vehicle_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  insurer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_number TEXT NOT NULL,
  cover_type TEXT NOT NULL,
  inception_date DATE,
  premium_amount NUMERIC(10,2),
  insurer_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vehicle_policies
  ADD COLUMN IF NOT EXISTS vehicle_id UUID,
  ADD COLUMN IF NOT EXISTS insurer_id UUID,
  ADD COLUMN IF NOT EXISTS policy_number TEXT,
  ADD COLUMN IF NOT EXISTS cover_type TEXT,
  ADD COLUMN IF NOT EXISTS inception_date DATE,
  ADD COLUMN IF NOT EXISTS premium_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS insurer_reference TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.vehicle_policies
  ALTER COLUMN vehicle_id SET NOT NULL,
  ALTER COLUMN insurer_id SET NOT NULL,
  ALTER COLUMN policy_number SET NOT NULL,
  ALTER COLUMN cover_type SET NOT NULL;
