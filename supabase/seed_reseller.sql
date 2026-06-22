-- CarSafe — Reseller seed data
-- Assigns the test reseller (c0c345d5-4780-4748-9d24-b53e3a46e7f9) to a
-- selection of seeded vehicles and marks them as for_sale.
-- Safe to re-run: uses array_append only when id is not already present.

DO $$
DECLARE
  reseller_id TEXT := 'c0c345d5-4780-4748-9d24-b53e3a46e7f9';
  vehicle_ids UUID[] := ARRAY[
    '00000000-0000-0000-0000-000000000003'::UUID,  -- Ford Ranger 2.0SiT XLT
    '00000000-0000-0000-0000-000000000005'::UUID,  -- Mercedes-Benz C200 AMG Line
    '00000000-0000-0000-0000-000000000007'::UUID,  -- Hyundai Venue 1.0T Fluid
    '00000000-0000-0000-0000-000000000008'::UUID,  -- Kia Picanto 1.2 Street
    '00000000-0000-0000-0000-000000000012'::UUID   -- Nissan Navara 2.5DDTi PRO-4X
  ];
  vid UUID;
BEGIN
  FOREACH vid IN ARRAY vehicle_ids LOOP
    UPDATE public.vehicles
    SET
      status                = 'for_sale',
      allow_reseller_access = true,
      approved_reseller_ids = CASE
        WHEN approved_reseller_ids @> ARRAY[reseller_id]
        THEN approved_reseller_ids
        ELSE array_append(approved_reseller_ids, reseller_id)
      END
    WHERE id = vid;
  END LOOP;
END $$;
