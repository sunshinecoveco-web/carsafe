-- Insurer flag system support.
CREATE TABLE IF NOT EXISTS public.vehicle_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  insurer_id TEXT NOT NULL,
  flag_type TEXT NOT NULL,
  description TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'external')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vehicle_flags
  ADD COLUMN IF NOT EXISTS vehicle_id UUID,
  ADD COLUMN IF NOT EXISTS insurer_id TEXT,
  ADD COLUMN IF NOT EXISTS flag_type TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
