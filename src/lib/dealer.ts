import { supabase } from '@/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DealerProfile {
  id: string;
  userId: string;
  dealershipName: string;
  registrationNumber: string;
  address: string;
  contactNumber: string;
  contactEmail: string;
  isVerified: boolean;
  createdAt: string;
}

export interface DealerVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  registrationNumber: string | null;
  colour: string | null;
  mileage: number | null;
  status: 'active' | 'for_sale' | 'in_claim';
  condition: string | null;
  askingPrice: number | null;
}

// ─── DB row types ─────────────────────────────────────────────────────────────

type DbDealerProfile = {
  id: string;
  user_id: string;
  dealership_name: string;
  registration_number: string;
  address: string;
  contact_number: string;
  contact_email: string;
  is_verified: boolean;
  created_at: string;
};

type DbVehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  registration_number: string | null;
  colour: string | null;
  mileage: number | null;
  status: string;
  condition: string | null;
  asking_price: string | null;
};

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toProfile(row: DbDealerProfile): DealerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    dealershipName: row.dealership_name,
    registrationNumber: row.registration_number,
    address: row.address,
    contactNumber: row.contact_number,
    contactEmail: row.contact_email,
    isVerified: row.is_verified,
    createdAt: row.created_at,
  };
}

function toDealerVehicle(row: DbVehicle): DealerVehicle {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    vin: row.vin,
    registrationNumber: row.registration_number,
    colour: row.colour,
    mileage: row.mileage,
    status: row.status as DealerVehicle['status'],
    condition: row.condition,
    askingPrice: row.asking_price ? Number(row.asking_price) : null,
  };
}

const VEHICLE_COLS =
  'id, make, model, year, vin, registration_number, colour, mileage, status, condition, asking_price';

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getDealerProfile(userId: string): Promise<DealerProfile | null> {
  const { data, error } = await supabase
    .from('dealer_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return toProfile(data as DbDealerProfile);
}

export interface CreateDealerProfileInput {
  dealershipName: string;
  registrationNumber: string;
  address: string;
  contactNumber: string;
  contactEmail: string;
}

export async function createDealerProfile(
  userId: string,
  input: CreateDealerProfileInput,
): Promise<{ profile: DealerProfile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('dealer_profiles')
    .insert({
      user_id: userId,
      dealership_name: input.dealershipName,
      registration_number: input.registrationNumber,
      address: input.address,
      contact_number: input.contactNumber,
      contact_email: input.contactEmail,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('dealer_profiles_email_key'))
        return { profile: null, error: 'A dealership profile already exists for this email address.' };
      if (error.message.includes('dealer_profiles_reg_number_key'))
        return { profile: null, error: 'A dealership with this registration number already exists.' };
      if (error.message.includes('dealer_profiles_user_id_key'))
        return { profile: null, error: 'You already have a dealership profile.' };
    }
    return { profile: null, error: error.message };
  }

  return { profile: toProfile(data as DbDealerProfile), error: null };
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export async function getDealerVehicles(dealerId: string): Promise<DealerVehicle[]> {
  const { data: links } = await supabase
    .from('dealer_vehicle_links')
    .select('vehicle_id')
    .eq('dealer_id', dealerId);

  if (!links || links.length === 0) return [];

  const ids = (links as { vehicle_id: string }[]).map(l => l.vehicle_id);
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select(VEHICLE_COLS)
    .in('id', ids)
    .order('make');

  return ((vehicles ?? []) as DbVehicle[]).map(toDealerVehicle);
}

// Two sequential queries to safely handle spaces in registration numbers.
export async function searchVehicleByRegOrVin(query: string): Promise<DealerVehicle | null> {
  const q = query.trim();
  if (!q) return null;

  const { data: byReg } = await supabase
    .from('vehicles')
    .select(VEHICLE_COLS)
    .ilike('registration_number', q)
    .maybeSingle();
  if (byReg) return toDealerVehicle(byReg as DbVehicle);

  const { data: byVin } = await supabase
    .from('vehicles')
    .select(VEHICLE_COLS)
    .ilike('vin', q)
    .maybeSingle();
  return byVin ? toDealerVehicle(byVin as DbVehicle) : null;
}

export async function isVehicleLinked(dealerId: string, vehicleId: string): Promise<boolean> {
  const { data } = await supabase
    .from('dealer_vehicle_links')
    .select('id')
    .eq('dealer_id', dealerId)
    .eq('vehicle_id', vehicleId)
    .maybeSingle();
  return !!data;
}

export async function linkVehicleToDealer(
  dealerId: string,
  vehicleId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('dealer_vehicle_links')
    .insert({ dealer_id: dealerId, vehicle_id: vehicleId });

  if (error) {
    if (error.code === '23505')
      return { error: 'This vehicle is already linked to your dealership.' };
    return { error: error.message };
  }
  return { error: null };
}

export interface CreateDealerVehicleInput {
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  vin: string;
  colour: string;
  mileage: number;
  condition: string;
  askingPrice: number | null;
  status: 'active' | 'for_sale' | 'in_claim';
}

// Returns the new vehicleId on success, or an existing vehicle if duplicate detected.
export async function createDealerVehicle(
  profile: DealerProfile,
  input: CreateDealerVehicleInput,
): Promise<{ vehicleId: string | null; existing: DealerVehicle | null; error: string | null }> {
  const reg = input.registrationNumber.trim().toUpperCase();
  const vin = input.vin.trim().toUpperCase();

  // App-level pre-check before hitting the DB constraint
  const existing =
    (await searchVehicleByRegOrVin(reg)) ?? (await searchVehicleByRegOrVin(vin));
  if (existing) return { vehicleId: null, existing, error: 'exists' };

  // owner_id is omitted — dealer listings have no customer owner until sold.
  // vehicles.owner_id is nullable; the FK only applies when set.
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .insert({
      make: input.make,
      model: input.model,
      year: input.year,
      registration_number: reg,
      vin,
      colour: input.colour,
      mileage: input.mileage,
      condition: input.condition,
      asking_price: input.askingPrice,
      status: input.status,
      image_url: '',
      allow_dealer_service_access: true,
      allow_reseller_access: false,
      allow_insurance_access: false,
    })
    .select('id')
    .single();

  if (error) {
    // Race condition: another insert beat us between the check and the insert
    if (error.code === '23505')
      return { vehicleId: null, existing: null, error: 'A vehicle with this registration number or VIN already exists.' };
    return { vehicleId: null, existing: null, error: error.message };
  }

  await supabase
    .from('dealer_vehicle_links')
    .insert({ dealer_id: profile.id, vehicle_id: vehicle.id });

  await supabase.from('activity_logs').insert({
    vehicle_id: vehicle.id,
    occurred_at: new Date().toISOString(),
    user_id: profile.userId,
    action: 'Vehicle Created',
    details: `${input.year} ${input.make} ${input.model} listed by ${profile.dealershipName}`,
    hash: '',
    previous_hash: '',
  });

  return { vehicleId: vehicle.id, existing: null, error: null };
}

// ─── Service records ──────────────────────────────────────────────────────────

export interface AddServiceRecordInput {
  vehicleId: string;
  serviceDate: string;
  category: string;
  description: string;
  mileageAtService: number;
  technicianName: string;
  labourCost: number;
  totalCost: number;
  parts: Array<{ name: string; quantity: number }>;
  notes: string;
}

export async function addDealerServiceRecord(
  profile: DealerProfile,
  input: AddServiceRecordInput,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('service_logs').insert({
    vehicle_id: input.vehicleId,
    service_date: input.serviceDate,
    category: input.category,
    description: input.description,
    mileage_at_service: input.mileageAtService,
    workshop: input.technicianName,
    labour_cost: input.labourCost,
    cost: input.totalCost,
    parts: JSON.stringify(input.parts),
    notes: input.notes,
    status: 'Completed',
    dealer_id: profile.id,
  });

  if (error) {
    if (error.code === '23505')
      return {
        error: `A ${input.category} record already exists for this vehicle on ${input.serviceDate} from your dealership.`,
      };
    return { error: error.message };
  }

  await supabase.from('activity_logs').insert({
    vehicle_id: input.vehicleId,
    occurred_at: new Date().toISOString(),
    user_id: profile.userId,
    action: 'Service Added',
    details: `${input.category} on ${input.serviceDate} added by ${profile.dealershipName}`,
    hash: '',
    previous_hash: '',
  });

  return { error: null };
}
