-- Insurer link request flow support.
CREATE TABLE IF NOT EXISTS public.vehicle_link_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  insurer_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vehicle_link_requests
  ADD COLUMN IF NOT EXISTS vehicle_id UUID,
  ADD COLUMN IF NOT EXISTS insurer_id TEXT,
  ADD COLUMN IF NOT EXISTS owner_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
