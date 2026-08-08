-- CarSafe seed data — run AFTER migrate.sql and policies.sql.
-- Uses fixed UUIDs throughout so the script is idempotent (safe to re-run).
-- Child records (service_logs, fuel_records, activity_logs) are deleted then
-- re-inserted each run so stale rows never accumulate.
--
-- Auth user IDs come from Supabase auth.users (jfaunhjmauibixvehosu project):
--   owner@carsafe.test   → 2d340498-6e5e-406d-b47e-a1acc60ed078
--   dealer@carsafe.test  → 8bc4d8ad-8f49-43d6-acca-3c8586e073a0
--   reseller@carsafe.test→ c0c345d5-4780-4748-9d24-b53e3a46e7f9
--   insurer@carsafe.test → 032bccbd-e329-45e7-8f22-fc27692704c2

DO $$
DECLARE
  -- Auth user IDs (match Supabase auth.users and login-form.tsx mockUsers)
  owner_id    UUID := '2d340498-6e5e-406d-b47e-a1acc60ed078';
  dealer_id   UUID := '8bc4d8ad-8f49-43d6-acca-3c8586e073a0';
  reseller_id UUID := 'c0c345d5-4780-4748-9d24-b53e3a46e7f9';
  insurer_id  UUID := '032bccbd-e329-45e7-8f22-fc27692704c2';

  -- Dealer business-record IDs (public.dealers table — separate from auth users)
  d1 UUID := '00000000-0000-0000-0001-000000000001';
  d2 UUID := '00000000-0000-0000-0001-000000000002';
  d3 UUID := '00000000-0000-0000-0001-000000000003';
  d4 UUID := '00000000-0000-0000-0001-000000000004';

  -- Vehicles
  v1  UUID := '00000000-0000-0000-0000-000000000001';
  v2  UUID := '00000000-0000-0000-0000-000000000002';
  v3  UUID := '00000000-0000-0000-0000-000000000003';
  v4  UUID := '00000000-0000-0000-0000-000000000004';
  v5  UUID := '00000000-0000-0000-0000-000000000005';
  v6  UUID := '00000000-0000-0000-0000-000000000006';
  v7  UUID := '00000000-0000-0000-0000-000000000007';
  v8  UUID := '00000000-0000-0000-0000-000000000008';
  v9  UUID := '00000000-0000-0000-0000-000000000009';
  v10 UUID := '00000000-0000-0000-0000-000000000010';
  v11 UUID := '00000000-0000-0000-0000-000000000011';
  v12 UUID := '00000000-0000-0000-0000-000000000012';
  v13 UUID := '00000000-0000-0000-0000-000000000013';
  v14 UUID := '00000000-0000-0000-0000-000000000014';
  v15 UUID := '00000000-0000-0000-0000-000000000015';

  all_vehicles UUID[];
BEGIN
  all_vehicles := ARRAY[v1,v2,v3,v4,v5,v6,v7,v8,v9,v10,v11,v12,v13,v14,v15];

  -- ── Owner ────────────────────────────────────────────────────────────────
  INSERT INTO public.owners (id, name, email, role) VALUES
    (owner_id, 'Demo Owner', 'owner@carsafe.test', 'owner')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- ── Dealers ──────────────────────────────────────────────────────────────
  INSERT INTO public.dealers (id, name, phone, is_verified) VALUES
    (d1, 'Cape Town Toyota City',     NULL, true),
    (d2, 'VW Master Cars Sandton',    NULL, true),
    (d3, 'Ford Performance Pretoria', NULL, true),
    (d4, 'BMW Auto Bavaria',          NULL, true)
  ON CONFLICT (id) DO UPDATE SET
    name        = EXCLUDED.name,
    is_verified = EXCLUDED.is_verified;

  -- ── Vehicles ─────────────────────────────────────────────────────────────
  -- approved_dealer_ids / approved_reseller_ids / approved_insurance_ids store
  -- Supabase auth user UUIDs so the client-side includes() filter matches userId.
  INSERT INTO public.vehicles (
    id, owner_id, make, model, year, vin, status, image_url, image_hint,
    insurance_provider, insurance_policy_number, insurance_coverage, insurance_expires,
    approved_dealer_ids, approved_reseller_ids, approved_insurance_ids,
    allow_dealer_service_access, allow_reseller_access, allow_insurance_access
  ) VALUES
    (v1,  owner_id,'Toyota',       'Hilux 2.8GD-6 Legend',      2023,'AHTFR28SA12345678','active',
     'https://picsum.photos/seed/hilux1/600/400',  'white bakkie',
     'Discovery Insure','DISC-001','Comprehensive','2025-06-01',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[]::TEXT[], true,false,false),

    (v2,  owner_id,'Volkswagen',   'Polo Vivo 1.4 Trendline',   2022,'WVWZZZ6SA45678901','active',
     'https://picsum.photos/seed/polo1/600/400',   'silver hatchback',
     'Outsurance','OUT-002','Comprehensive','2024-12-31',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[]::TEXT[], true,false,false),

    (v3,  owner_id,'Ford',         'Ranger 2.0SiT XLT',         2021,'1FTFX1SA789012345','for_sale',
     'https://picsum.photos/seed/ranger1/600/400', 'blue bakkie',
     'Santam','SAN-003','Full Cover','2024-11-15',
     ARRAY[dealer_id::TEXT],ARRAY[reseller_id::TEXT],ARRAY[]::TEXT[], true,true,false),

    (v4,  owner_id,'BMW',          '320i M Sport',              2021,'WBA5F3SA012345678','in_claim',
     'https://picsum.photos/seed/bmw1/600/400',    'black sedan',
     'Hollard','HOL-004','Comprehensive','2025-02-20',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[insurer_id::TEXT], true,false,true),

    (v5,  owner_id,'Mercedes-Benz','C200 AMG Line',             2022,'WDD205SA345678901','active',
     'https://picsum.photos/seed/merc1/600/400',   'white luxury sedan',
     'Discovery','DISC-005','Comprehensive','2025-01-01',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[]::TEXT[], true,false,false),

    (v6,  owner_id,'Isuzu',        'D-Max 3.0 Ddi V-Cross',    2023,'AFG123SA678901234','active',
     'https://picsum.photos/seed/isuzu1/600/400',  'grey pickup',
     'Outsurance','OUT-006','Comprehensive','2025-08-15',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[]::TEXT[], true,false,false),

    (v7,  owner_id,'Hyundai',      'Venue 1.0T Fluid',          2022,'KMH523SA901234567','active',
     'https://picsum.photos/seed/hyundai1/600/400','red compact suv',
     'Santam','SAN-007','Comprehensive','2025-03-10',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[]::TEXT[], true,false,false),

    (v8,  owner_id,'Kia',          'Picanto 1.2 Street',        2021,'KNA234SA234567890','for_sale',
     'https://picsum.photos/seed/kia1/600/400',    'blue hatchback',
     'Hollard','HOL-008','Comprehensive','2024-10-15',
     ARRAY[dealer_id::TEXT],ARRAY[reseller_id::TEXT],ARRAY[]::TEXT[], true,true,false),

    (v9,  owner_id,'Toyota',       'Fortuner 2.8GD-6 4x4 VX',  2024,'AHT223SA567890123','active',
     'https://picsum.photos/seed/fortuner1/600/400','black suv',
     'Discovery','DISC-009','Comprehensive','2025-01-20',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[]::TEXT[], true,false,false),

    (v10, owner_id,'Haval',        'Jolion 1.5T Super Luxury',  2023,'LGW123SA890123456','active',
     'https://picsum.photos/seed/haval1/600/400',  'blue crossover',
     'Outsurance','OUT-010','Comprehensive','2025-06-15',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[]::TEXT[], true,false,false),

    (v11, owner_id,'Chery',        'Tiggo 4 Pro Elite',         2023,'CHY456SA111222333','active',
     'https://picsum.photos/seed/chery1/600/400',  'white crossover',
     'Santam','SAN-011','Comprehensive','2025-09-01',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[]::TEXT[], true,false,false),

    (v12, owner_id,'Nissan',       'Navara 2.5DDTi PRO-4X',     2022,'NIS112SA222333444','active',
     'https://picsum.photos/seed/navara1/600/400', 'grey bakkie',
     'Hollard','HOL-012','Comprehensive','2025-01-10',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[]::TEXT[], true,false,false),

    (v13, owner_id,'Suzuki',       'Swift 1.2 GLX',             2023,'SUZ334SA333444555','active',
     'https://picsum.photos/seed/swift1/600/400',  'red hatchback',
     'Discovery','DISC-013','Comprehensive','2025-05-05',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[]::TEXT[], true,false,false),

    (v14, owner_id,'Mazda',        'CX-5 2.0 Carbon Edition',   2021,'MAZ556SA444555666','active',
     'https://picsum.photos/seed/mazda1/600/400',  'grey suv',
     'Outsurance','OUT-014','Comprehensive','2025-04-12',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[]::TEXT[], true,false,false),

    (v15, owner_id,'Volkswagen',   'Golf 8 GTI',                2022,'WVW887SA555666777','in_claim',
     'https://picsum.photos/seed/golf81/600/400',  'red hot hatch',
     'Santam','SAN-015','Comprehensive','2025-02-15',
     ARRAY[dealer_id::TEXT],ARRAY[]::TEXT[],ARRAY[insurer_id::TEXT], true,false,true)

  ON CONFLICT (id) DO UPDATE SET
    owner_id                    = EXCLUDED.owner_id,
    image_hint                  = EXCLUDED.image_hint,
    insurance_provider          = EXCLUDED.insurance_provider,
    insurance_policy_number     = EXCLUDED.insurance_policy_number,
    insurance_coverage          = EXCLUDED.insurance_coverage,
    insurance_expires           = EXCLUDED.insurance_expires,
    approved_dealer_ids         = EXCLUDED.approved_dealer_ids,
    approved_reseller_ids       = EXCLUDED.approved_reseller_ids,
    approved_insurance_ids      = EXCLUDED.approved_insurance_ids,
    allow_dealer_service_access = EXCLUDED.allow_dealer_service_access,
    allow_reseller_access       = EXCLUDED.allow_reseller_access,
    allow_insurance_access      = EXCLUDED.allow_insurance_access;

  -- ── Clear child tables before re-inserting ────────────────────────────────
  DELETE FROM public.service_logs  WHERE vehicle_id = ANY(all_vehicles);
  DELETE FROM public.fuel_records  WHERE vehicle_id = ANY(all_vehicles);
  DELETE FROM public.activity_logs WHERE vehicle_id = ANY(all_vehicles);

  -- ── Service logs ──────────────────────────────────────────────────────────
  INSERT INTO public.service_logs
    (vehicle_id, service_date, description, cost, status, parts, notes, workshop, category)
  VALUES
    (v1,'2024-08-15','10,000km Major Service',3500,'Completed','[{"name":"Oil Filter","quantity":1},{"name":"Diesel Filter","quantity":1}]','Full synthetic oil, fuel filter replaced.','Cape Town Toyota City','Routine Maintenance'),
    (v1,'2024-04-10','Brake Pad Replacement',2200,'Completed',NULL,'Front pads replaced with OEM parts.','Cape Town Toyota City','Repairs'),
    (v1,'2023-12-10','First Inspection',800,'Completed',NULL,'Initial health check.','Cape Town Toyota City','Inspection'),

    (v2,'2024-02-20','Annual Inspection',1200,'Completed',NULL,'Passed roadworthy.','VW Master Cars Sandton','Inspection'),
    (v2,'2023-08-15','Tyre Rotation',450,'Completed',NULL,'Balanced all four wheels.','VW Master Cars Sandton','Tires'),
    (v2,'2023-02-15','Minor Service',1800,'Completed',NULL,'Oil change and filter.','VW Master Cars Sandton','Routine Maintenance'),

    (v3,'2024-01-22','Oil & Filter Change',1250,'Completed',NULL,'Standard maintenance.','Ford Performance Pretoria','Routine Maintenance'),
    (v3,'2023-06-15','Wiper Blade Replacement',600,'Completed',NULL,'','Ford Performance Pretoria','Routine Maintenance'),
    (v3,'2023-01-15','Full Service',4200,'Completed',NULL,'Replaced spark plugs.','Ford Performance Pretoria','Routine Maintenance'),

    (v4,'2024-09-01','Panel Damage Assessment',0,'Awaiting Approval',NULL,'Front end collision damage.','BMW Auto Bavaria','Repairs'),
    (v4,'2024-03-10','Microfilter Replacement',950,'Completed',NULL,'','BMW Auto Bavaria','Routine Maintenance'),
    (v4,'2023-09-15','Brake Fluid Flush',1200,'Completed',NULL,'','BMW Auto Bavaria','Routine Maintenance'),

    (v5,'2024-05-15','Brake Fluid Flush',1500,'Completed',NULL,'Recommended maintenance.','Cape Town Toyota City','Routine Maintenance'),
    (v5,'2023-11-10','Wiper Blade Set',850,'Completed',NULL,'','Cape Town Toyota City','Routine Maintenance'),
    (v5,'2023-05-10','Annual Service A',3800,'Completed',NULL,'','Cape Town Toyota City','Routine Maintenance'),

    (v6,'2024-07-15','Wheel Alignment',650,'Completed',NULL,'','Cape Town Toyota City','Tires'),
    (v6,'2024-01-15','Oil & Filter Change',1450,'Completed',NULL,'First routine service.','Cape Town Toyota City','Routine Maintenance'),
    (v6,'2023-11-20','Pre-delivery Inspection',0,'Completed',NULL,'','Cape Town Toyota City','Inspection'),

    (v7,'2024-03-10','15,000km Service',2100,'Completed',NULL,'','VW Master Cars Sandton','Routine Maintenance'),
    (v7,'2023-09-05','Battery Replacement',1850,'Completed',NULL,'','VW Master Cars Sandton','Repairs'),
    (v7,'2023-03-05','Annual Checkup',1200,'Completed',NULL,'','VW Master Cars Sandton','Routine Maintenance'),

    (v8,'2024-02-12','Aircon Regas',850,'Completed',NULL,'','VW Master Cars Sandton','Other'),
    (v8,'2023-09-12','Full Service',2800,'Completed',NULL,'','VW Master Cars Sandton','Routine Maintenance'),
    (v8,'2022-09-10','Minor Service',1500,'Completed',NULL,'','VW Master Cars Sandton','Routine Maintenance'),

    (v9,'2024-08-10','Mud Flap Install',1200,'Completed',NULL,'','Cape Town Toyota City','Other'),
    (v9,'2024-05-20','Health Check',500,'Completed',NULL,'','Cape Town Toyota City','Inspection'),
    (v9,'2024-01-20','Pre-delivery Inspection',0,'Completed',NULL,'','Cape Town Toyota City','Inspection'),

    (v10,'2024-06-15','First Service',1500,'Completed',NULL,'','Ford Performance Pretoria','Routine Maintenance'),
    (v10,'2024-02-10','Software Patch',250,'Completed',NULL,'','Ford Performance Pretoria','Other'),
    (v10,'2023-12-10','Wheel Alignment',450,'Completed',NULL,'','Ford Performance Pretoria','Tires'),

    (v11,'2024-07-20','Spark Plug Check',450,'Completed',NULL,'','Ford Performance Pretoria','Routine Maintenance'),
    (v11,'2024-03-05','Software Update',300,'Completed',NULL,'','Ford Performance Pretoria','Other'),
    (v11,'2023-10-10','Minor Fix: Door Creak',150,'Completed',NULL,'','Ford Performance Pretoria','Repairs'),

    (v12,'2024-01-10','Maintenance',3200,'Completed',NULL,'','Cape Town Toyota City','Routine Maintenance'),
    (v12,'2023-07-15','Diff Oil Change',1400,'Completed',NULL,'','Cape Town Toyota City','Routine Maintenance'),
    (v12,'2023-01-10','Minor Service',1800,'Completed',NULL,'','Cape Town Toyota City','Routine Maintenance'),

    (v13,'2024-09-10','Wiper Blade Change',350,'Completed',NULL,'','VW Master Cars Sandton','Routine Maintenance'),
    (v13,'2024-05-10','Oil Change',950,'Completed',NULL,'','VW Master Cars Sandton','Routine Maintenance'),
    (v13,'2023-06-01','First Health Check',200,'Completed',NULL,'','VW Master Cars Sandton','Inspection'),

    (v14,'2024-08-20','Air Filter Change',550,'Completed',NULL,'','Cape Town Toyota City','Routine Maintenance'),
    (v14,'2024-04-12','45,000km Service',4500,'Completed',NULL,'','Cape Town Toyota City','Routine Maintenance'),
    (v14,'2023-04-10','30,000km Service',3800,'Completed',NULL,'','Cape Town Toyota City','Routine Maintenance'),

    (v15,'2024-09-10','Theft Recovery Inspection',350,'In Progress',NULL,'','VW Master Cars Sandton','Inspection'),
    (v15,'2024-06-01','Oil Top-up',250,'Completed',NULL,'','VW Master Cars Sandton','Routine Maintenance'),
    (v15,'2024-02-15','Performance Brake Service',4200,'Completed',NULL,'','VW Master Cars Sandton','Repairs');

  -- ── Fuel records ──────────────────────────────────────────────────────────
  INSERT INTO public.fuel_records (vehicle_id, fuel_date, amount, cost, odometer) VALUES
    (v1,'2024-09-01',75,1800,10500),(v1,'2024-08-10',70,1700,9800),(v1,'2024-07-15',80,1950,9100),
    (v2,'2024-09-05',40,950,22400),(v2,'2024-08-15',38,900,21800),(v2,'2024-07-20',42,1000,21200),
    (v3,'2024-08-20',80,1900,45000),(v3,'2024-07-25',75,1800,44200),(v3,'2024-06-30',82,1950,43400),
    (v4,'2024-08-25',55,1350,32000),(v4,'2024-07-20',50,1200,31400),(v4,'2024-06-15',52,1250,30800),
    (v5,'2024-09-01',60,1450,18000),(v5,'2024-08-10',58,1400,17200),(v5,'2024-07-15',62,1500,16400),
    (v6,'2024-09-02',75,1850,12000),(v6,'2024-08-12',70,1750,11300),(v6,'2024-07-20',78,1900,10600),
    (v7,'2024-09-01',45,1100,16500),(v7,'2024-08-15',42,1050,15900),(v7,'2024-07-25',40,1000,15300),
    (v8,'2024-08-20',35,850,35000),(v8,'2024-07-25',32,780,34400),(v8,'2024-06-30',34,820,33800),
    (v9,'2024-09-01',80,1950,5000),(v9,'2024-08-15',78,1900,4200),(v9,'2024-07-20',85,2100,3400),
    (v10,'2024-09-05',50,1250,14500),(v10,'2024-08-15',48,1200,13900),(v10,'2024-07-25',52,1300,13300),
    (v11,'2024-09-01',50,1200,11000),(v11,'2024-08-10',45,1100,10400),(v11,'2024-07-15',48,1150,9800),
    (v12,'2024-09-05',80,1900,28000),(v12,'2024-08-15',75,1800,27200),(v12,'2024-07-20',82,1950,26400),
    (v13,'2024-09-01',35,850,12000),(v13,'2024-08-15',32,780,11400),(v13,'2024-07-20',30,750,10800),
    (v14,'2024-09-05',55,1350,42000),(v14,'2024-08-15',52,1300,41300),(v14,'2024-07-25',58,1400,40600),
    (v15,'2024-09-01',50,1250,22000),(v15,'2024-08-15',48,1200,21400),(v15,'2024-07-20',55,1350,20800);

  -- ── Activity logs ─────────────────────────────────────────────────────────
  INSERT INTO public.activity_logs
    (vehicle_id, occurred_at, user_id, action, details, hash, previous_hash)
  VALUES
    (v1,'2024-08-15T10:00:00Z',dealer_id::TEXT,'Service Added','10,000km Service','8f2c3d...','a1b2c3...'),
    (v1,'2024-04-10T14:30:00Z',dealer_id::TEXT,'Service Added','Brake pads','a1b2c3...','b2c3d4...'),
    (v1,'2023-12-10T09:00:00Z',dealer_id::TEXT,'Service Added','Inspection','b2c3d4...','000000...'),

    (v2,'2024-02-20T11:00:00Z',dealer_id::TEXT,'Service Added','Inspection','9e3d4f...','b2c3d4...'),
    (v2,'2023-08-15T10:00:00Z',dealer_id::TEXT,'Service Added','Tyre rotation','b2c3d4...','c3d4e5...'),
    (v2,'2023-02-15T10:00:00Z',dealer_id::TEXT,'Service Added','Minor Service','c3d4e5...','000000...'),

    (v3,'2024-03-01T10:00:00Z',owner_id::TEXT,'Ownership Transferred','Marked for sale','1a2b3c...','c3d4e5...'),
    (v3,'2024-01-22T13:00:00Z',dealer_id::TEXT,'Service Added','Oil Change','c3d4e5...','d4e5f6...'),
    (v3,'2023-01-15T10:00:00Z',dealer_id::TEXT,'Service Added','Full Service','d4e5f6...','000000...'),

    (v4,'2024-09-01T09:15:00Z',dealer_id::TEXT,'Service Added','Claim Assessment','2b3c4d...','d4e5f6...'),
    (v4,'2024-03-10T10:00:00Z',dealer_id::TEXT,'Service Added','Microfilter','d4e5f6...','e5f6g7...'),
    (v4,'2023-09-15T10:00:00Z',dealer_id::TEXT,'Service Added','Brake fluid','e5f6g7...','000000...'),

    (v5,'2024-05-15T10:00:00Z',dealer_id::TEXT,'Service Added','Brake Service','3c4d5e...','e5f6g7...'),
    (v5,'2023-11-10T10:00:00Z',dealer_id::TEXT,'Service Added','Wipers','e5f6g7...','f6g7h8...'),
    (v5,'2023-05-10T11:00:00Z',dealer_id::TEXT,'Service Added','Service A','f6g7h8...','000000...'),

    (v6,'2024-07-15T10:00:00Z',dealer_id::TEXT,'Service Added','Alignment','4d5e6f...','f5g6h7...'),
    (v6,'2024-01-15T10:00:00Z',dealer_id::TEXT,'Service Added','Oil change','f5g6h7...','g6h7i8...'),
    (v6,'2023-11-20T10:00:00Z','system','Vehicle Created','Initial Registry','g6h7i8...','000000...'),

    (v7,'2024-03-10T10:00:00Z',dealer_id::TEXT,'Service Added','15k Service','5e6f7g...','g6h7i8...'),
    (v7,'2023-09-05T14:00:00Z',dealer_id::TEXT,'Service Added','Battery','g6h7i8...','h7i8j9...'),
    (v7,'2022-05-15T10:00:00Z','system','Vehicle Created','New Entry','h7i8j9...','000000...'),

    (v8,'2023-12-01T10:00:00Z',owner_id::TEXT,'Ownership Transferred','Listed for sale','6f7g8h...','h7i8j9...'),
    (v8,'2021-01-10T10:00:00Z','system','Vehicle Created','Registration','h7i8j9...','000000...'),

    (v9,'2024-08-10T11:00:00Z',dealer_id::TEXT,'Service Added','Accessories','7g8h9i...','i8j9k0...'),
    (v9,'2024-05-20T10:00:00Z',dealer_id::TEXT,'Service Added','Health check','i8j9k0...','j9k0l1...'),
    (v9,'2024-01-20T10:00:00Z','system','Vehicle Created','New Vehicle','j9k0l1...','000000...'),

    (v10,'2024-06-15T10:00:00Z',dealer_id::TEXT,'Service Added','First Service','8h9i0j...','j9k0l1...'),
    (v10,'2024-02-10T09:00:00Z',dealer_id::TEXT,'Service Added','Software','j9k0l1...','k0l1m2...'),
    (v10,'2023-06-15T10:00:00Z','system','Vehicle Created','Initial Registry','k0l1m2...','000000...'),

    (v11,'2024-07-20T10:00:00Z',dealer_id::TEXT,'Service Added','Spark plugs','9i0j1k...','k0l1m2...'),
    (v11,'2024-03-05T10:00:00Z',dealer_id::TEXT,'Service Added','System update','k0l1m2...','l1m2n3...'),
    (v11,'2023-09-01T10:00:00Z','system','Vehicle Created','New Arrival','l1m2n3...','000000...'),

    (v12,'2024-01-10T10:00:00Z',dealer_id::TEXT,'Service Added','Routine service','0j1k2l...','l1m2n3...'),
    (v12,'2023-07-15T11:00:00Z',dealer_id::TEXT,'Service Added','Diff oil','l1m2n3...','m2n3o4...'),
    (v12,'2022-01-10T10:00:00Z','system','Vehicle Created','Registration','m2n3o4...','000000...'),

    (v13,'2024-09-10T10:00:00Z',dealer_id::TEXT,'Service Added','Wipers','1k2l3m...','m2n3o4...'),
    (v13,'2024-05-10T10:00:00Z',dealer_id::TEXT,'Service Added','First service','m2n3o4...','n3o4p5...'),
    (v13,'2023-05-05T10:00:00Z','system','Vehicle Created','New Entry','n3o4p5...','000000...'),

    (v14,'2024-08-20T10:00:00Z',dealer_id::TEXT,'Service Added','Air filter','2l3m4n...','n3o4p5...'),
    (v14,'2024-04-12T10:00:00Z',dealer_id::TEXT,'Service Added','45k Service','n3o4p5...','o4p5q6...'),
    (v14,'2021-04-12T10:00:00Z','system','Vehicle Created','Initial Setup','o4p5q6...','000000...'),

    (v15,'2024-09-10T10:00:00Z',dealer_id::TEXT,'Service Added','Claim assessment','3m4n5o...','o4p5q6...'),
    (v15,'2024-06-01T10:00:00Z',dealer_id::TEXT,'Service Added','Oil top-up','o4p5q6...','p5q6r7...'),
    (v15,'2022-02-15T10:00:00Z','system','Vehicle Created','Registry','p5q6r7...','000000...');

END $$;
