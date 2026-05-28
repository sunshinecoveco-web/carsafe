import { getVehicles } from '@/lib/data';
import { VehicleList } from '@/components/dashboard/vehicle-list';

export const dynamic = 'force-dynamic';

export default async function VehiclesPage() {
  const vehicles = await getVehicles();
  return <VehicleList vehicles={vehicles} />;
}
