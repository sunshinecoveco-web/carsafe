
import { getVehicleById } from '@/lib/data';
import { VehicleDetails } from '@/components/vehicle/vehicle-details';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="pl-0">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Your Vehicles
            </Link>
        </Button>
      </div>
      <VehicleDetails vehicle={vehicle} />
    </div>
  );
}
