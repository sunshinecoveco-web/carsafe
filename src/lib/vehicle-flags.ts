export interface VehicleFlagInsertPayload {
  vehicle_id: string;
  insurer_id: string;
  flag_type: string;
  description: string;
  visibility: 'internal' | 'external';
}

export function buildVehicleFlagInsertPayload(
  vehicleId: string,
  insurerId: string,
  description: string
): VehicleFlagInsertPayload {
  return {
    vehicle_id: vehicleId,
    insurer_id: insurerId,
    flag_type: 'Fraud Indicator',
    description: description.trim() || `Flagged by insurer via VIN lookup.`,
    visibility: 'external',
  };
}
