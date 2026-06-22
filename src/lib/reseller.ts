import { supabase } from '@/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResellerProfile {
  id: string;
  userId: string;
  companyName: string;
  contactEmail: string;
  contactNumber: string;
  address: string;
  createdAt: string;
}

export interface ResellerVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  registrationNumber: string | null;
  colour: string | null;
  mileage: number | null;
  status: 'active' | 'for_sale' | 'in_claim';
  askingPrice: number | null;
}

// ─── DB row types ─────────────────────────────────────────────────────────────

type DbResellerProfile = {
  id: string;
  user_id: string;
  company_name: string;
  contact_email: string;
  contact_number: string;
  address: string;
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
  asking_price: string | null;
};

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toProfile(row: DbResellerProfile): ResellerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    contactEmail: row.contact_email,
    contactNumber: row.contact_number,
    address: row.address,
    createdAt: row.created_at,
  };
}

function toResellerVehicle(row: DbVehicle): ResellerVehicle {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    vin: row.vin,
    registrationNumber: row.registration_number,
    colour: row.colour,
    mileage: row.mileage,
    status: row.status as ResellerVehicle['status'],
    askingPrice: row.asking_price ? Number(row.asking_price) : null,
  };
}

const VEHICLE_COLS =
  'id, make, model, year, vin, registration_number, colour, mileage, status, asking_price';

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getResellerProfile(userId: string): Promise<ResellerProfile | null> {
  const { data, error } = await supabase
    .from('reseller_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return toProfile(data as DbResellerProfile);
}

export interface CreateResellerProfileInput {
  companyName: string;
  contactEmail: string;
  contactNumber: string;
  address: string;
}

export async function createResellerProfile(
  userId: string,
  input: CreateResellerProfileInput,
): Promise<{ profile: ResellerProfile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('reseller_profiles')
    .insert({
      user_id: userId,
      company_name: input.companyName,
      contact_email: input.contactEmail,
      contact_number: input.contactNumber,
      address: input.address,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('reseller_profiles_email_key'))
        return { profile: null, error: 'A reseller profile already exists for this email address.' };
      if (error.message.includes('reseller_profiles_user_id_key'))
        return { profile: null, error: 'You already have a reseller profile.' };
    }
    return { profile: null, error: error.message };
  }

  return { profile: toProfile(data as DbResellerProfile), error: null };
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

// Returns vehicles where the reseller's userId appears in approved_reseller_ids.
// Supabase supports array containment with the `cs` (contains) filter.
export async function getResellerVehicles(userId: string): Promise<ResellerVehicle[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(VEHICLE_COLS)
    .contains('approved_reseller_ids', [userId])
    .order('make');

  if (error || !data) return [];
  return (data as DbVehicle[]).map(toResellerVehicle);
}
