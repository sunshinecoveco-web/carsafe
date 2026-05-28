import { supabase } from '@/supabase';
import type { Vehicle, Dealer, ServiceRecord, FuelRecord, ActivityLogEntry } from './types';
import type { ServiceCategory } from './types';

// ─── DB row types ─────────────────────────────────────────────────────────────

type DbVehicle = {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  status: string;
  image_url: string;
  image_hint: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  insurance_coverage: string | null;
  insurance_expires: string | null;
  approved_dealer_ids: string[] | null;
  approved_reseller_ids: string[] | null;
  approved_insurance_ids: string[] | null;
  allow_dealer_service_access: boolean;
  allow_reseller_access: boolean;
  allow_insurance_access: boolean;
};

type DbServiceLog = {
  id: string;
  vehicle_id: string;
  service_date: string;
  description: string;
  cost: number;
  status: string;
  parts: string | null;          // TEXT column storing a JSON string
  notes: string | null;
  workshop: string | null;       // existing column — maps to servicedBy
  category: string | null;
  invoice_url: string | null;
  photos: Array<{ url: string; label: string }> | null;  // JSONB
};

type DbFuelRecord = {
  id: string;
  vehicle_id: string;
  fuel_date: string;
  amount: number;
  cost: number;
  odometer: number;
};

type DbActivityLog = {
  id: string;
  vehicle_id: string;
  occurred_at: string;
  user_id: string;
  action: string;
  details: string | null;
  hash: string | null;
  previous_hash: string | null;
};

type DbDealer = {
  id: string;
  name: string;
  is_verified: boolean;
};

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toServiceRecord(row: DbServiceLog): ServiceRecord {
  let parts: Array<{ name: string; quantity: number }> = [];
  if (row.parts) {
    try { parts = JSON.parse(row.parts); } catch { parts = []; }
  }
  return {
    id: row.id,
    date: row.service_date,
    service: row.description,
    cost: row.cost,
    notes: row.notes ?? '',
    status: row.status as ServiceRecord['status'],
    parts,
    servicedBy: row.workshop ?? undefined,
    category: row.category ? (row.category as ServiceCategory) : undefined,
    invoiceUrl: row.invoice_url ?? undefined,
    photos: row.photos ?? undefined,
  };
}

function toFuelRecord(row: DbFuelRecord): FuelRecord {
  return {
    id: row.id,
    date: row.fuel_date,
    amount: Number(row.amount),
    cost: Number(row.cost),
    odometer: row.odometer,
  };
}

function toActivityLogEntry(row: DbActivityLog): ActivityLogEntry {
  return {
    id: row.id,
    timestamp: row.occurred_at,
    user: row.user_id,
    action: row.action as ActivityLogEntry['action'],
    details: row.details ?? '',
    hash: row.hash ?? '',
    previousHash: row.previous_hash ?? '',
  };
}

function toVehicle(
  row: DbVehicle,
  logs: DbServiceLog[],
  fuel: DbFuelRecord[],
  activity: DbActivityLog[],
): Vehicle {
  return {
    id: row.id,
    ownerId: row.owner_id,
    make: row.make,
    model: row.model,
    year: row.year,
    vin: row.vin,
    status: row.status as Vehicle['status'],
    imageUrl: row.image_url,
    imageHint: row.image_hint ?? '',
    serviceHistory: logs
      .map(toServiceRecord)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    fuelHistory: fuel
      .map(toFuelRecord)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    insurance: {
      provider: row.insurance_provider ?? '',
      policyNumber: row.insurance_policy_number ?? '',
      coverage: row.insurance_coverage ?? '',
      expires: row.insurance_expires ?? '',
    },
    approvedDealerIds: row.approved_dealer_ids ?? [],
    approvedResellerIds: row.approved_reseller_ids ?? [],
    approvedInsuranceIds: row.approved_insurance_ids ?? [],
    activityLog: activity
      .map(toActivityLogEntry)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    consents: {
      allowDealerServiceAccess: row.allow_dealer_service_access,
      allowResellerAccess: row.allow_reseller_access,
      allowInsuranceAccess: row.allow_insurance_access,
    },
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getVehicles(): Promise<Vehicle[]> {
  const [
    { data: vehicles, error },
    { data: serviceLogs },
    { data: fuelRecords },
    { data: activityLogs },
  ] = await Promise.all([
    supabase.from('vehicles').select('*'),
    supabase.from('service_logs').select('*'),
    supabase.from('fuel_records').select('*'),
    supabase.from('activity_logs').select('*'),
  ]);

  if (error) throw error;

  const logs = (serviceLogs ?? []) as DbServiceLog[];
  const fuel = (fuelRecords ?? []) as DbFuelRecord[];
  const activity = (activityLogs ?? []) as DbActivityLog[];

  return (vehicles ?? []).map(v =>
    toVehicle(
      v as DbVehicle,
      logs.filter(l => l.vehicle_id === v.id),
      fuel.filter(f => f.vehicle_id === v.id),
      activity.filter(a => a.vehicle_id === v.id),
    )
  );
}

export async function getVehicleById(id: string): Promise<Vehicle | undefined> {
  const [
    { data: vehicle, error },
    { data: serviceLogs },
    { data: fuelRecords },
    { data: activityLogs },
  ] = await Promise.all([
    supabase.from('vehicles').select('*').eq('id', id).single(),
    supabase.from('service_logs').select('*').eq('vehicle_id', id),
    supabase.from('fuel_records').select('*').eq('vehicle_id', id),
    supabase.from('activity_logs').select('*').eq('vehicle_id', id),
  ]);

  if (error || !vehicle) return undefined;

  return toVehicle(
    vehicle as DbVehicle,
    (serviceLogs ?? []) as DbServiceLog[],
    (fuelRecords ?? []) as DbFuelRecord[],
    (activityLogs ?? []) as DbActivityLog[],
  );
}

export async function getDealers(): Promise<Dealer[]> {
  const { data, error } = await supabase.from('dealers').select('id, name, is_verified');
  if (error) throw error;
  return (data ?? []).map((row: DbDealer) => ({
    id: row.id,
    name: row.name,
    isVerified: row.is_verified,
  }));
}
