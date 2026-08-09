
import { z } from "zod";

export interface Photo {
  url: string;
  label: string;
}

export interface Part {
  name: string;
  quantity: number;
}

export type ServiceStatus = 'Scheduled' | 'In Progress' | 'Awaiting Approval' | 'Ready for Pickup' | 'Completed';

export const ServiceCategoryEnum = z.enum(['Routine Maintenance', 'Repairs', 'Tires', 'Inspection', 'Other']);
export type ServiceCategory = z.infer<typeof ServiceCategoryEnum>;

export interface ServiceRecord {
  id: string;
  date: string;
  service: string;
  cost: number;
  notes: string;
  servicedBy?: string;
  parts?: Part[];
  invoiceUrl?: string;
  photos?: Photo[];
  status: ServiceStatus;
  category?: ServiceCategory;
  mileageAtService?: number;
  technicianName?: string;
  createdByRole?: string;
  createdByUserId?: string;
}

export interface FuelRecord {
  id: string;
  date: string;
  amount: number; // Liters for ICE, kWh for EV
  cost: number;
  odometer: number;
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  coverage: string;
  expires: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'Vehicle Created' | 'Service Added' | 'Service Edited' | 'Service Deleted' | 'Ownership Transferred' | 'Consent Updated';
  details: string;
  hash: string; // Cryptographic hash of this entry
  previousHash: string; // Hash of the previous entry, forming the chain
}

export interface Dealer {
    id: string;
    name: string;
    isVerified: boolean;
}

export interface VehicleConsents {
    allowDealerServiceAccess: boolean;
    allowResellerAccess: boolean;
    allowInsuranceAccess: boolean;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  registrationNumber?: string;
  colour?: string;
  mileage?: number;
  licenceDiscUrl?: string;
  status: 'active' | 'for_sale' | 'in_claim' | 'insurer_added';
  imageUrl: string;
  imageHint?: string;
  serviceHistory: ServiceRecord[];
  fuelHistory: FuelRecord[];
  insurance: InsuranceDetails;
  approvedDealerIds?: string[];
  approvedResellerIds?: string[];
  approvedInsuranceIds?: string[];
  isDemoHero?: boolean;
  activityLog: ActivityLogEntry[];
  consents: VehicleConsents;
}

export const PredictNextServiceInputSchema = z.object({
  make: z.string().describe('The make of the vehicle.'),
  model: z.string().describe('The model of the vehicle.'),
  year: z.number().describe('The year the vehicle was manufactured.'),
  serviceHistory: z.string().describe('A list of historical services performed on the vehicle, including dates.'),
});
export type PredictNextServiceInput = z.infer<typeof PredictNextServiceInputSchema>;

export const PredictNextServiceOutputSchema = z.object({
  predictedService: z.string().describe("The name of the single most likely next routine service needed (e.g., 'Oil Change', 'Tire Rotation & Brake Inspection')."),
  predictedDate: z.string().describe("The estimated date for the next service in YYYY-MM-DD format."),
  reasoning: z.string().describe("A brief explanation for the prediction, referencing the vehicle's history and typical maintenance intervals."),
});
export type PredictNextServiceOutput = z.infer<typeof PredictNextServiceOutputSchema>;

export const FuelProjectionInputSchema = z.object({
  make: z.string(),
  model: z.string(),
  fuelHistory: z.string().describe("Newline separated list of fuel/energy records (Date, Amount, Cost, Odometer)"),
});
export type FuelProjectionInput = z.infer<typeof FuelProjectionInputSchema>;

export const FuelProjectionOutputSchema = z.object({
  currentEfficiency: z.string().describe("Current efficiency (e.g., '8.5 L/100km' or '18.2 kWh/100km')"),
  projectedMonthlyCost: z.number().describe("Projected cost for the next 30 days"),
  insight: z.string().describe("A concise insight about the usage patterns."),
});
export type FuelProjectionOutput = z.infer<typeof FuelProjectionOutputSchema>;

export interface Chat {
  id: string;
  vehicleId: string;
  participants: string[];
  lastMessageText?: string;
  lastMessageAt?: Date;
}

export interface ChatMessage {
  id: string;
  text?: string;
  senderId: string;
  createdAt: Date;
  imageUrl?: string;
}
