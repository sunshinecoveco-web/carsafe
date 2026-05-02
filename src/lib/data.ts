import type { Vehicle, Dealer } from './types';

const dealers: Dealer[] = [
    { id: 'dealer-1', name: 'Cape Town Toyota City', isVerified: true },
    { id: 'dealer-2', name: 'VW Master Cars Sandton', isVerified: true },
    { id: 'dealer-3', name: 'Ford Performance Pretoria', isVerified: true },
    { id: 'dealer-4', name: 'BMW Auto Bavaria', isVerified: true },
];

const vehicles: Vehicle[] = [
  {
    id: '1',
    ownerId: 'owner-1',
    make: 'Toyota',
    model: 'Hilux 2.8GD-6 Legend',
    year: 2023,
    vin: 'AHTFR28SA12345678',
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/hilux1/600/400',
    imageHint: 'white bakkie',
    serviceHistory: [
      { id: 's1-1', date: '2024-08-15', service: '10,000km Major Service', cost: 3500, notes: 'Full synthetic oil, fuel filter replaced.', servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Routine Maintenance', parts: [{ name: 'Oil Filter', quantity: 1 }, { name: 'Diesel Filter', quantity: 1 }] },
      { id: 's1-2', date: '2024-04-10', service: 'Brake Pad Replacement', cost: 2200, notes: 'Front pads replaced with OEM parts.', servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Repairs' },
      { id: 's1-3', date: '2023-12-10', service: 'First Inspection', cost: 800, notes: 'Initial health check.', servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Inspection' }
    ],
    fuelHistory: [
        { id: 'f1-1', date: '2024-09-01', amount: 75, cost: 1800, odometer: 10500 },
        { id: 'f1-2', date: '2024-08-10', amount: 70, cost: 1700, odometer: 9800 },
        { id: 'f1-3', date: '2024-07-15', amount: 80, cost: 1950, odometer: 9100 },
    ],
    insurance: { provider: 'Discovery Insure', policyNumber: 'DISC-001', coverage: 'Comprehensive', expires: '2025-06-01' },
    approvedDealerIds: ['dealer-1'],
    activityLog: [
        { id: 'act-1-1', timestamp: '2024-08-15T10:00:00Z', user: 'dealer-1', action: 'Service Added', details: '10,000km Service', hash: '8f2c3d...', previousHash: 'a1b2c3...' },
        { id: 'act-1-2', timestamp: '2024-04-10T14:30:00Z', user: 'dealer-1', action: 'Service Added', details: 'Brake pads', hash: 'a1b2c3...', previousHash: 'b2c3d4...' },
        { id: 'act-1-3', timestamp: '2023-12-10T09:00:00Z', user: 'dealer-1', action: 'Service Added', details: 'Inspection', hash: 'b2c3d4...', previousHash: '000000...' },
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: false }
  },
  {
    id: '2',
    ownerId: 'owner-1',
    make: 'Volkswagen',
    model: 'Polo Vivo 1.4 Trendline',
    year: 2022,
    vin: 'WVWZZZ6SA45678901',
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/polo1/600/400',
    imageHint: 'silver hatchback',
    serviceHistory: [
      { id: 's2-1', date: '2024-02-20', service: 'Annual Inspection', cost: 1200, notes: 'Passed roadworthy.', servicedBy: 'VW Master Cars Sandton', category: 'Inspection', status: 'Completed' },
      { id: 's2-2', date: '2023-08-15', service: 'Tyre Rotation', cost: 450, notes: 'Balanced all four wheels.', servicedBy: 'VW Master Cars Sandton', category: 'Tires', status: 'Completed' },
      { id: 's2-3', date: '2023-02-15', service: 'Minor Service', cost: 1800, notes: 'Oil change and filter.', servicedBy: 'VW Master Cars Sandton', category: 'Routine Maintenance', status: 'Completed' }
    ],
    fuelHistory: [
        { id: 'f2-1', date: '2024-09-05', amount: 40, cost: 950, odometer: 22400 },
        { id: 'f2-2', date: '2024-08-15', amount: 38, cost: 900, odometer: 21800 },
        { id: 'f2-3', date: '2024-07-20', amount: 42, cost: 1000, odometer: 21200 },
    ],
    insurance: { provider: 'Outsurance', policyNumber: 'OUT-002', coverage: 'Comprehensive', expires: '2024-12-31' },
    approvedDealerIds: ['dealer-2'],
    activityLog: [
        { id: 'act-2-1', timestamp: '2024-02-20T11:00:00Z', user: 'dealer-2', action: 'Service Added', details: 'Inspection', hash: '9e3d4f...', previousHash: 'b2c3d4...' },
        { id: 'act-2-2', timestamp: '2023-08-15T10:00:00Z', user: 'dealer-2', action: 'Service Added', details: 'Tyre rotation', hash: 'b2c3d4...', previousHash: 'c3d4e5...' },
        { id: 'act-2-3', timestamp: '2023-02-15T10:00:00Z', user: 'dealer-2', action: 'Service Added', details: 'Minor Service', hash: 'c3d4e5...', previousHash: '000000...' },
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: false }
  },
  {
    id: '3',
    ownerId: 'owner-1',
    make: 'Ford',
    model: 'Ranger 2.0SiT XLT',
    year: 2021,
    vin: '1FTFX1SA789012345',
    status: 'for_sale',
    imageUrl: 'https://picsum.photos/seed/ranger1/600/400',
    imageHint: 'blue bakkie',
    serviceHistory: [
      { id: 's3-1', date: '2024-01-22', service: 'Oil & Filter Change', cost: 1800, notes: 'Standard maintenance.', servicedBy: 'Ford Performance Pretoria', category: 'Routine Maintenance', status: 'Completed' },
      { id: 's3-2', date: '2023-06-15', service: 'Wiper Blade Replacement', cost: 600, servicedBy: 'Ford Performance Pretoria', category: 'Routine Maintenance', status: 'Completed' },
      { id: 's3-3', date: '2023-01-15', service: 'Full Service', cost: 4200, notes: 'Replaced spark plugs.', servicedBy: 'Ford Performance Pretoria', category: 'Routine Maintenance', status: 'Completed' }
    ],
    fuelHistory: [
        { id: 'f3-1', date: '2024-08-20', amount: 80, cost: 1900, odometer: 45000 },
        { id: 'f3-2', date: '2024-07-25', amount: 75, cost: 1800, odometer: 44200 },
        { id: 'f3-3', date: '2024-06-30', amount: 82, cost: 1950, odometer: 43400 },
    ],
    insurance: { provider: 'Santam', policyNumber: 'SAN-003', coverage: 'Full Cover', expires: '2024-11-15' },
    approvedDealerIds: ['dealer-3'],
    approvedResellerIds: ['reseller-1'],
    activityLog: [
        { id: 'act-3-1', timestamp: '2024-03-01T10:00:00Z', user: 'owner-1', action: 'Ownership Transferred', details: 'Marked for sale', hash: '1a2b3c...', previousHash: 'c3d4e5...' },
        { id: 'act-3-2', timestamp: '2024-01-22T13:00:00Z', user: 'dealer-3', action: 'Service Added', details: 'Oil Change', hash: 'c3d4e5...', previousHash: 'd4e5f6...' },
        { id: 'act-3-3', timestamp: '2023-01-15T10:00:00Z', user: 'dealer-3', action: 'Service Added', details: 'Full Service', hash: 'd4e5f6...', previousHash: '000000...' },
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: true, allowInsuranceAccess: false }
  },
  {
    id: '4',
    ownerId: 'owner-1',
    make: 'BMW',
    model: '320i M Sport',
    year: 2021,
    vin: 'WBA5F3SA012345678',
    status: 'in_claim',
    imageUrl: 'https://picsum.photos/seed/bmw1/600/400',
    imageHint: 'black sedan',
    serviceHistory: [
      { id: 's4-1', date: '2024-09-01', service: 'Panel Damage Assessment', cost: 0, notes: 'Front end collision damage.', servicedBy: 'BMW Auto Bavaria', category: 'Repairs', status: 'Awaiting Approval' },
      { id: 's4-2', date: '2024-03-10', service: 'Microfilter Replacement', cost: 950, servicedBy: 'BMW Auto Bavaria', category: 'Routine Maintenance', status: 'Completed' },
      { id: 's4-3', date: '2023-09-15', service: 'Brake Fluid Flush', cost: 1200, servicedBy: 'BMW Auto Bavaria', category: 'Routine Maintenance', status: 'Completed' }
    ],
    fuelHistory: [
        { id: 'f4-1', date: '2024-08-25', amount: 55, cost: 1350, odometer: 32000 },
        { id: 'f4-2', date: '2024-07-20', amount: 50, cost: 1200, odometer: 31400 },
        { id: 'f4-3', date: '2024-06-15', amount: 52, cost: 1250, odometer: 30800 },
    ],
    insurance: { provider: 'Hollard', policyNumber: 'HOL-004', coverage: 'Comprehensive', expires: '2025-02-20' },
    approvedDealerIds: ['dealer-4'],
    approvedInsuranceIds: ['insurance-1'],
    activityLog: [
        { id: 'act-4-1', timestamp: '2024-09-01T09:15:00Z', user: 'dealer-4', action: 'Service Added', details: 'Claim Assessment', hash: '2b3c4d...', previousHash: 'd4e5f6...' },
        { id: 'act-4-2', timestamp: '2024-03-10T10:00:00Z', user: 'dealer-4', action: 'Service Added', details: 'Microfilter', hash: 'd4e5f6...', previousHash: 'e5f6g7...' },
        { id: 'act-4-3', timestamp: '2023-09-15T10:00:00Z', user: 'dealer-4', action: 'Service Added', details: 'Brake fluid', hash: 'e5f6g7...', previousHash: '000000...' },
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: true }
  },
  {
    id: '5',
    ownerId: 'owner-1',
    make: 'Mercedes-Benz',
    model: 'C200 AMG Line',
    year: 2022,
    vin: 'WDD205SA345678901',
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/merc1/600/400',
    imageHint: 'white luxury sedan',
    serviceHistory: [
      { id: 's5-1', date: '2024-05-15', service: 'Brake Fluid Flush', cost: 1500, notes: 'Recommended maintenance.', servicedBy: 'Cape Town Toyota City', category: 'Routine Maintenance', status: 'Completed' },
      { id: 's5-2', date: '2023-11-10', service: 'Wiper Blade Set', cost: 850, servicedBy: 'Cape Town Toyota City', category: 'Routine Maintenance', status: 'Completed' },
      { id: 's5-3', date: '2023-05-10', service: 'Annual Service A', cost: 3800, servicedBy: 'Cape Town Toyota City', category: 'Routine Maintenance', status: 'Completed' }
    ],
    fuelHistory: [
        { id: 'f5-1', date: '2024-09-01', amount: 60, cost: 1450, odometer: 18000 },
        { id: 'f5-2', date: '2024-08-10', amount: 58, cost: 1400, odometer: 17200 },
        { id: 'f5-3', date: '2024-07-15', amount: 62, cost: 1500, odometer: 16400 },
    ],
    insurance: { provider: 'Discovery', policyNumber: 'DISC-005', coverage: 'Comprehensive', expires: '2025-01-01' },
    approvedDealerIds: ['dealer-1'],
    activityLog: [
        { id: 'act-5-1', timestamp: '2024-05-15T10:00:00Z', user: 'dealer-1', action: 'Service Added', details: 'Brake Service', hash: '3c4d5e...', previousHash: 'e5f6g7...' },
        { id: 'act-5-2', timestamp: '2023-11-10T10:00:00Z', user: 'dealer-1', action: 'Service Added', details: 'Wipers', hash: 'e5f6g7...', previousHash: 'f6g7h8...' },
        { id: 'act-5-3', timestamp: '2023-05-10T11:00:00Z', user: 'dealer-1', action: 'Service Added', details: 'Service A', hash: 'f6g7h8...', previousHash: '000000...' },
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: false }
  },
  {
    id: '6',
    ownerId: 'owner-1',
    make: 'Isuzu',
    model: 'D-Max 3.0 Ddi V-Cross',
    year: 2023,
    vin: 'AFG123SA678901234',
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/isuzu1/600/400',
    imageHint: 'grey pickup',
    serviceHistory: [
      { id: 's6-1', date: '2024-07-15', service: 'Wheel Alignment', cost: 650, servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Tires' },
      { id: 's6-2', date: '2024-01-15', service: 'Oil & Filter Change', cost: 1450, notes: 'First routine service.', servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Routine Maintenance' },
      { id: 's6-3', date: '2023-11-20', service: 'Pre-delivery Inspection', cost: 0, servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Inspection' }
    ],
    fuelHistory: [
        { id: 'f6-1', date: '2024-09-02', amount: 75, cost: 1850, odometer: 12000 },
        { id: 'f6-2', date: '2024-08-12', amount: 70, cost: 1750, odometer: 11300 },
        { id: 'f6-3', date: '2024-07-20', amount: 78, cost: 1900, odometer: 10600 },
    ],
    insurance: { provider: 'Outsurance', policyNumber: 'OUT-006', coverage: 'Comprehensive', expires: '2025-08-15' },
    approvedDealerIds: ['dealer-1'],
    activityLog: [
      { id: 'act-6-1', timestamp: '2024-07-15T10:00:00Z', user: 'dealer-1', action: 'Service Added', details: 'Alignment', hash: '4d5e6f...', previousHash: 'f5g6h7...' },
      { id: 'act-6-2', timestamp: '2024-01-15T10:00:00Z', user: 'dealer-1', action: 'Service Added', details: 'Oil change', hash: 'f5g6h7...', previousHash: 'g6h7i8...' },
      { id: 'act-6-3', timestamp: '2023-11-20T10:00:00Z', user: 'system', action: 'Vehicle Created', details: 'Initial Registry', hash: 'g6h7i8...', previousHash: '000000...' }
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: false }
  },
  {
    id: '7',
    ownerId: 'owner-1',
    make: 'Hyundai',
    model: 'Venue 1.0T Fluid',
    year: 2022,
    vin: 'KMH523SA901234567',
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/hyundai1/600/400',
    imageHint: 'red compact suv',
    serviceHistory: [
      { id: 's7-1', date: '2024-03-10', service: '15,000km Service', cost: 2100, servicedBy: 'VW Master Cars Sandton', status: 'Completed', category: 'Routine Maintenance' },
      { id: 's7-2', date: '2023-09-05', service: 'Battery Replacement', cost: 1850, servicedBy: 'VW Master Cars Sandton', status: 'Completed', category: 'Repairs' },
      { id: 's7-3', date: '2023-03-05', service: 'Annual Checkup', cost: 1200, servicedBy: 'VW Master Cars Sandton', status: 'Completed', category: 'Routine Maintenance' }
    ],
    fuelHistory: [
        { id: 'f7-1', date: '2024-09-01', amount: 45, cost: 1100, odometer: 16500 },
        { id: 'f7-2', date: '2024-08-15', amount: 42, cost: 1050, odometer: 15900 },
        { id: 'f7-3', date: '2024-07-25', amount: 40, cost: 1000, odometer: 15300 },
    ],
    insurance: { provider: 'Santam', policyNumber: 'SAN-007', coverage: 'Comprehensive', expires: '2025-03-10' },
    approvedDealerIds: ['dealer-2'],
    activityLog: [
      { id: 'act-7-1', timestamp: '2024-03-10T10:00:00Z', user: 'dealer-2', action: 'Service Added', details: '15k Service', hash: '5e6f7g...', previousHash: 'g6h7i8...' },
      { id: 'act-7-2', timestamp: '2023-09-05T14:00:00Z', user: 'dealer-2', action: 'Service Added', details: 'Battery', hash: 'g6h7i8...', previousHash: 'h7i8j9...' },
      { id: 'act-7-3', timestamp: '2022-05-15T10:00:00Z', user: 'system', action: 'Vehicle Created', details: 'New Entry', hash: 'h7i8j9...', previousHash: '000000...' }
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: false }
  },
  {
    id: '8',
    ownerId: 'owner-1',
    make: 'Kia',
    model: 'Picanto 1.2 Street',
    year: 2021,
    vin: 'KNA234SA234567890',
    status: 'for_sale',
    imageUrl: 'https://picsum.photos/seed/kia1/600/400',
    imageHint: 'blue hatchback',
    serviceHistory: [
      { id: 's8-1', date: '2024-02-12', service: 'Aircon Regas', cost: 850, servicedBy: 'VW Master Cars Sandton', status: 'Completed', category: 'Other' },
      { id: 's8-2', date: '2023-09-12', service: 'Full Service', cost: 2800, servicedBy: 'VW Master Cars Sandton', status: 'Completed', category: 'Routine Maintenance' },
      { id: 's8-3', date: '2022-09-10', service: 'Minor Service', cost: 1500, servicedBy: 'VW Master Cars Sandton', status: 'Completed', category: 'Routine Maintenance' }
    ],
    fuelHistory: [
        { id: 'f8-1', date: '2024-08-20', amount: 35, cost: 850, odometer: 35000 },
        { id: 'f8-2', date: '2024-07-25', amount: 32, cost: 780, odometer: 34400 },
        { id: 'f8-3', date: '2024-06-30', amount: 34, cost: 820, odometer: 33800 },
    ],
    insurance: { provider: 'Hollard', policyNumber: 'HOL-008', coverage: 'Comprehensive', expires: '2024-10-15' },
    approvedDealerIds: ['dealer-2'],
    approvedResellerIds: ['reseller-1'],
    activityLog: [
      { id: 'act-8-1', timestamp: '2023-12-01T10:00:00Z', user: 'owner-1', action: 'Ownership Transferred', details: 'Listed for sale', hash: '6f7g8h...', previousHash: 'h7i8j9...' },
      { id: 'act-8-2', timestamp: '2021-01-10T10:00:00Z', user: 'system', action: 'Vehicle Created', details: 'Registration', hash: 'h7i8j9...', previousHash: '000000...' }
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: true, allowInsuranceAccess: false }
  },
  {
    id: '9',
    ownerId: 'owner-1',
    make: 'Toyota',
    model: 'Fortuner 2.8GD-6 4x4 VX',
    year: 2024,
    vin: 'AHT223SA567890123',
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/fortuner1/600/400',
    imageHint: 'black suv',
    serviceHistory: [
      { id: 's9-1', date: '2024-08-10', service: 'Mud Flap Install', cost: 1200, servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Other' },
      { id: 's9-2', date: '2024-05-20', service: 'Health Check', cost: 500, servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Inspection' },
      { id: 's9-3', date: '2024-01-20', service: 'Pre-delivery Inspection', cost: 0, servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Inspection' }
    ],
    fuelHistory: [
        { id: 'f9-1', date: '2024-09-01', amount: 80, cost: 1950, odometer: 5000 },
        { id: 'f9-2', date: '2024-08-15', amount: 78, cost: 1900, odometer: 4200 },
        { id: 'f9-3', date: '2024-07-20', amount: 85, cost: 2100, odometer: 3400 },
    ],
    insurance: { provider: 'Discovery', policyNumber: 'DISC-009', coverage: 'Comprehensive', expires: '2025-01-20' },
    approvedDealerIds: ['dealer-1'],
    activityLog: [
      { id: 'act-9-1', timestamp: '2024-08-10T11:00:00Z', user: 'dealer-1', action: 'Service Added', details: 'Accessories', hash: '7g8h9i...', previousHash: 'i8j9k0...' },
      { id: 'act-9-2', timestamp: '2024-05-20T10:00:00Z', user: 'dealer-1', action: 'Service Added', details: 'Health check', hash: 'i8j9k0...', previousHash: 'j9k0l1...' },
      { id: 'act-9-3', timestamp: '2024-01-20T10:00:00Z', user: 'system', action: 'Vehicle Created', details: 'New Vehicle', hash: 'j9k0l1...', previousHash: '000000...' }
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: false }
  },
  {
    id: '10',
    ownerId: 'owner-1',
    make: 'Haval',
    model: 'Jolion 1.5T Super Luxury',
    year: 2023,
    vin: 'LGW123SA890123456',
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/haval1/600/400',
    imageHint: 'blue crossover',
    serviceHistory: [
      { id: 's10-1', date: '2024-06-15', service: 'First Service', cost: 1500, servicedBy: 'Ford Performance Pretoria', status: 'Completed', category: 'Routine Maintenance' },
      { id: 's10-2', date: '2024-02-10', service: 'Software Patch', cost: 0, servicedBy: 'Ford Performance Pretoria', status: 'Completed', category: 'Other' },
      { id: 's10-3', date: '2023-12-10', service: 'Wheel Alignment', cost: 450, servicedBy: 'Ford Performance Pretoria', status: 'Completed', category: 'Tires' }
    ],
    fuelHistory: [
        { id: 'f10-1', date: '2024-09-05', amount: 50, cost: 1250, odometer: 14500 },
        { id: 'f10-2', date: '2024-08-15', amount: 48, cost: 1200, odometer: 13900 },
        { id: 'f10-3', date: '2024-07-25', amount: 52, cost: 1300, odometer: 13300 },
    ],
    insurance: { provider: 'Outsurance', policyNumber: 'OUT-010', coverage: 'Comprehensive', expires: '2025-06-15' },
    approvedDealerIds: ['dealer-3'],
    activityLog: [
      { id: 'act-10-1', timestamp: '2024-06-15T10:00:00Z', user: 'dealer-3', action: 'Service Added', details: 'First Service', hash: '8h9i0j...', previousHash: 'j9k0l1...' },
      { id: 'act-10-2', timestamp: '2024-02-10T09:00:00Z', user: 'dealer-3', action: 'Service Added', details: 'Software', hash: 'j9k0l1...', previousHash: 'k0l1m2...' },
      { id: 'act-10-3', timestamp: '2023-06-15T10:00:00Z', user: 'system', action: 'Vehicle Created', details: 'Initial Registry', hash: 'k0l1m2...', previousHash: '000000...' }
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: false }
  },
  {
    id: '11',
    ownerId: 'owner-1',
    make: 'Chery',
    model: 'Tiggo 4 Pro Elite',
    year: 2023,
    vin: 'CHY456SA111222333',
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/chery1/600/400',
    imageHint: 'white crossover',
    serviceHistory: [
      { id: 's11-1', date: '2024-07-20', service: 'Spark Plug Check', cost: 450, servicedBy: 'Ford Performance Pretoria', status: 'Completed', category: 'Routine Maintenance' },
      { id: 's11-2', date: '2024-03-05', service: 'Software Update', cost: 300, servicedBy: 'Ford Performance Pretoria', status: 'Completed', category: 'Other' },
      { id: 's11-3', date: '2023-10-10', service: 'Minor Fix: Door Creak', cost: 150, servicedBy: 'Ford Performance Pretoria', status: 'Completed', category: 'Repairs' }
    ],
    fuelHistory: [
        { id: 'f11-1', date: '2024-09-01', amount: 50, cost: 1200, odometer: 11000 },
        { id: 'f11-2', date: '2024-08-10', amount: 45, cost: 1100, odometer: 10400 },
        { id: 'f11-3', date: '2024-07-15', amount: 48, cost: 1150, odometer: 9800 },
    ],
    insurance: { provider: 'Santam', policyNumber: 'SAN-011', coverage: 'Comprehensive', expires: '2025-09-01' },
    approvedDealerIds: ['dealer-3'],
    activityLog: [
      { id: 'act-11-1', timestamp: '2024-07-20T10:00:00Z', user: 'dealer-3', action: 'Service Added', details: 'Spark plugs', hash: '9i0j1k...', previousHash: 'k0l1m2...' },
      { id: 'act-11-2', timestamp: '2024-03-05T10:00:00Z', user: 'dealer-3', action: 'Service Added', details: 'System update', hash: 'k0l1m2...', previousHash: 'l1m2n3...' },
      { id: 'act-11-3', timestamp: '2023-09-01T10:00:00Z', user: 'system', action: 'Vehicle Created', details: 'New Arrival', hash: 'l1m2n3...', previousHash: '000000...' }
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: false }
  },
  {
    id: '12',
    ownerId: 'owner-1',
    make: 'Nissan',
    model: 'Navara 2.5DDTi PRO-4X',
    year: 2022,
    vin: 'NIS112SA222333444',
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/navara1/600/400',
    imageHint: 'grey bakkie',
    serviceHistory: [
      { id: 's12-1', date: '2024-01-10', service: 'Maintenance', cost: 3200, servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Routine Maintenance' },
      { id: 's12-2', date: '2023-07-15', service: 'Diff Oil Change', cost: 1400, servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Routine Maintenance' },
      { id: 's12-3', date: '2023-01-10', service: 'Minor Service', cost: 1800, servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Routine Maintenance' }
    ],
    fuelHistory: [
        { id: 'f12-1', date: '2024-09-05', amount: 80, cost: 1900, odometer: 28000 },
        { id: 'f12-2', date: '2024-08-15', amount: 75, cost: 1800, odometer: 27200 },
        { id: 'f12-3', date: '2024-07-20', amount: 82, cost: 1950, odometer: 26400 },
    ],
    insurance: { provider: 'Hollard', policyNumber: 'HOL-012', coverage: 'Comprehensive', expires: '2025-01-10' },
    approvedDealerIds: ['dealer-1'],
    activityLog: [
      { id: 'act-12-1', timestamp: '2024-01-10T10:00:00Z', user: 'dealer-1', action: 'Service Added', details: 'Routine service', hash: '0j1k2l...', previousHash: 'l1m2n3...' },
      { id: 'act-12-2', timestamp: '2023-07-15T11:00:00Z', user: 'dealer-1', action: 'Service Added', details: 'Diff oil', hash: 'l1m2n3...', previousHash: 'm2n3o4...' },
      { id: 'act-12-3', timestamp: '2022-01-10T10:00:00Z', user: 'system', action: 'Vehicle Created', details: 'Registration', hash: 'm2n3o4...', previousHash: '000000...' }
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: false }
  },
  {
    id: '13',
    ownerId: 'owner-1',
    make: 'Suzuki',
    model: 'Swift 1.2 GLX',
    year: 2023,
    vin: 'SUZ334SA333444555',
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/swift1/600/400',
    imageHint: 'red hatchback',
    serviceHistory: [
      { id: 's13-1', date: '2024-09-10', service: 'Wiper Blade Change', cost: 350, servicedBy: 'VW Master Cars Sandton', status: 'Completed', category: 'Routine Maintenance' },
      { id: 's13-2', date: '2024-05-10', service: 'Oil Change', cost: 950, servicedBy: 'VW Master Cars Sandton', status: 'Completed', category: 'Routine Maintenance' },
      { id: 's13-3', date: '2023-06-01', service: 'First Health Check', cost: 200, servicedBy: 'VW Master Cars Sandton', status: 'Completed', category: 'Inspection' }
    ],
    fuelHistory: [
        { id: 'f13-1', date: '2024-09-01', amount: 35, cost: 850, odometer: 12000 },
        { id: 'f13-2', date: '2024-08-15', amount: 32, cost: 780, odometer: 11400 },
        { id: 'f13-3', date: '2024-07-20', amount: 30, cost: 750, odometer: 10800 },
    ],
    insurance: { provider: 'Discovery', policyNumber: 'DISC-013', coverage: 'Comprehensive', expires: '2025-05-05' },
    approvedDealerIds: ['dealer-2'],
    activityLog: [
      { id: 'act-13-1', timestamp: '2024-09-10T10:00:00Z', user: 'dealer-2', action: 'Service Added', details: 'Wipers', hash: '1k2l3m...', previousHash: 'm2n3o4...' },
      { id: 'act-13-2', timestamp: '2024-05-10T10:00:00Z', user: 'dealer-2', action: 'Service Added', details: 'First service', hash: 'm2n3o4...', previousHash: 'n3o4p5...' },
      { id: 'act-13-3', timestamp: '2023-05-05T10:00:00Z', user: 'system', action: 'Vehicle Created', details: 'New Entry', hash: 'n3o4p5...', previousHash: '000000...' }
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: false }
  },
  {
    id: '14',
    ownerId: 'owner-1',
    make: 'Mazda',
    model: 'CX-5 2.0 Carbon Edition',
    year: 2021,
    vin: 'MAZ556SA444555666',
    status: 'active',
    imageUrl: 'https://picsum.photos/seed/mazda1/600/400',
    imageHint: 'grey suv',
    serviceHistory: [
      { id: 's14-1', date: '2024-08-20', service: 'Air Filter Change', cost: 550, servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Routine Maintenance' },
      { id: 's14-2', date: '2024-04-12', service: '45,000km Service', cost: 4500, servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Routine Maintenance' },
      { id: 's14-3', date: '2023-04-10', service: '30,000km Service', cost: 3800, servicedBy: 'Cape Town Toyota City', status: 'Completed', category: 'Routine Maintenance' }
    ],
    fuelHistory: [
        { id: 'f14-1', date: '2024-09-05', amount: 55, cost: 1350, odometer: 42000 },
        { id: 'f14-2', date: '2024-08-15', amount: 52, cost: 1300, odometer: 41300 },
        { id: 'f14-3', date: '2024-07-25', amount: 58, cost: 1400, odometer: 40600 },
    ],
    insurance: { provider: 'Outsurance', policyNumber: 'OUT-014', coverage: 'Comprehensive', expires: '2025-04-12' },
    approvedDealerIds: ['dealer-1'],
    activityLog: [
      { id: 'act-14-1', timestamp: '2024-08-20T10:00:00Z', user: 'dealer-1', action: 'Service Added', details: 'Air filter', hash: '2l3m4n...', previousHash: 'n3o4p5...' },
      { id: 'act-14-2', timestamp: '2024-04-12T10:00:00Z', user: 'dealer-1', action: 'Service Added', details: '45k Service', hash: 'n3o4p5...', previousHash: 'o4p5q6...' },
      { id: 'act-14-3', timestamp: '2021-04-12T10:00:00Z', user: 'system', action: 'Vehicle Created', details: 'Initial Setup', hash: 'o4p5q6...', previousHash: '000000...' }
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: false }
  },
  {
    id: '15',
    ownerId: 'owner-1',
    make: 'Volkswagen',
    model: 'Golf 8 GTI',
    year: 2022,
    vin: 'WVW887SA555666777',
    status: 'in_claim',
    imageUrl: 'https://picsum.photos/seed/golf81/600/400',
    imageHint: 'red hot hatch',
    serviceHistory: [
      { id: 's15-1', date: '2024-09-10', service: 'Theft Recovery Inspection', cost: 0, servicedBy: 'VW Master Cars Sandton', status: 'In Progress', category: 'Inspection' },
      { id: 's15-2', date: '2024-06-01', service: 'Oil Top-up', cost: 250, servicedBy: 'VW Master Cars Sandton', status: 'Completed', category: 'Routine Maintenance' },
      { id: 's15-3', date: '2024-02-15', service: 'Performance Brake Service', cost: 5500, servicedBy: 'VW Master Cars Sandton', status: 'Completed', category: 'Repairs' }
    ],
    fuelHistory: [
        { id: 'f15-1', date: '2024-09-01', amount: 50, cost: 1250, odometer: 22000 },
        { id: 'f15-2', date: '2024-08-15', amount: 48, cost: 1200, odometer: 21400 },
        { id: 'f15-3', date: '2024-07-20', amount: 55, cost: 1350, odometer: 20800 },
    ],
    insurance: { provider: 'Santam', policyNumber: 'SAN-015', coverage: 'Comprehensive', expires: '2025-02-15' },
    approvedDealerIds: ['dealer-2'],
    approvedInsuranceIds: ['insurance-1'],
    activityLog: [
      { id: 'act-15-1', timestamp: '2024-09-10T10:00:00Z', user: 'dealer-2', action: 'Service Added', details: 'Claim assessment', hash: '3m4n5o...', previousHash: 'o4p5q6...' },
      { id: 'act-15-2', timestamp: '2024-06-01T10:00:00Z', user: 'dealer-2', action: 'Service Added', details: 'Oil top-up', hash: 'o4p5q6...', previousHash: 'p5q6r7...' },
      { id: 'act-15-3', timestamp: '2022-02-15T10:00:00Z', user: 'system', action: 'Vehicle Created', details: 'Registry', hash: 'p5q6r7...', previousHash: '000000...' }
    ],
    consents: { allowDealerServiceAccess: true, allowResellerAccess: false, allowInsuranceAccess: true }
  },
];

export async function getVehicles(): Promise<Vehicle[]> {
  return vehicles;
}

export async function getVehicleById(id: string): Promise<Vehicle | undefined> {
  return vehicles.find(v => v.id === id);
}

export async function getDealers(): Promise<Dealer[]> {
    return dealers;
}
