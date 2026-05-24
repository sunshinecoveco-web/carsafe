import { getVehicles } from '@/lib/data';
import { VehicleList } from '@/components/dashboard/vehicle-list';

export default async function VehiclesPage() {
  const vehicles = await getVehicles();
  return <VehicleList vehicles={vehicles} />;
}
