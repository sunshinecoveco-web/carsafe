
"use client";

import { useEffect, useState } from 'react';
import type { Vehicle } from '@/lib/types';
import { getVehicles } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { VehicleList } from '@/components/dashboard/vehicle-list';
import { Skeleton } from '@/components/ui/skeleton';
import { UpcomingServices } from '@/components/dashboard/upcoming-services';
import { ServiceProgress } from '@/components/dashboard/service-progress';
import { CostOfOwnershipChart } from '@/components/dashboard/cost-of-ownership-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2Off } from 'lucide-react';

const DashboardSkeleton = () => (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 gap-8">
            <Skeleton className="h-52 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
        <header className="mb-8 mt-8">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="mt-2 h-6 w-3/4" />
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-48 rounded-lg" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
    </div>
);

export default function DashboardPage() {
  const auth = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !auth.isAuthenticated || !auth.userId) {
      if (isClient && !auth.isAuthenticated) setIsLoading(false);
      return;
    }

    const fetchVehicles = async () => {
      setIsLoading(true);
      const allVehicles = await getVehicles();

      const transferredIdsString = localStorage.getItem('carsafe_transferred_ids');
      const transferredIds = transferredIdsString ? JSON.parse(transferredIdsString) : [];
      const availableVehicles = allVehicles.filter(v => !transferredIds.includes(v.id));

      let userVehicles: Vehicle[] = [];
      const { role, userId } = auth;

      if (role === 'owner') {
        userVehicles = availableVehicles.filter(v => v.ownerId === userId);
      } else if (role === 'dealer') {
        userVehicles = availableVehicles.filter(v => v.approvedDealerIds?.includes(userId));
      } else if (role === 'reseller') {
        userVehicles = availableVehicles.filter(v => v.status === 'for_sale' && v.approvedResellerIds?.includes(userId));
      } else if (role === 'insurance') {
        userVehicles = availableVehicles.filter(v => v.status === 'in_claim' && v.approvedInsuranceIds?.includes(userId));
      }
      
      setVehicles(userVehicles);
      setIsLoading(false);
    };

    fetchVehicles();
  }, [isClient, auth.isAuthenticated, auth.role, auth.userId]);

  if (!isClient || isLoading) {
    return <DashboardSkeleton />;
  }

  const getPageTitle = () => {
    if ((auth.role === 'dealer' || auth.role === 'reseller' || auth.role === 'insurance') && vehicles.length === 0) {
      return "No Vehicles Assigned";
    }
    if (auth.role === 'dealer') {
      return "Assigned Vehicle Fleet";
    }
     if (auth.role === 'reseller') {
      return "Approved Vehicles for Resale";
    }
    if (auth.role === 'insurance') {
        return "Active Insurance Claims";
    }
    return "Your Vehicles";
  }

  const getPageDescription = () => {
     if ((auth.role === 'dealer' || auth.role === 'reseller' || auth.role === 'insurance') && vehicles.length === 0) {
      if (auth.role === 'insurance') {
        return "When a vehicle in a claim is assigned to you, it will appear here.";
      }
      return "When a vehicle owner grants you access, it will appear here.";
    }
    return "Select a vehicle to view its details, service history, and more.";
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      {auth.role === 'owner' && <ServiceProgress vehicles={vehicles} />}
      {auth.role === 'owner' && <CostOfOwnershipChart vehicles={vehicles} />}
      {auth.role === 'dealer' && vehicles.length > 0 && <UpcomingServices vehicles={vehicles} />}

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {getPageTitle()}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {getPageDescription()}
        </p>
      </header>
      {vehicles.length > 0 ? (
        <VehicleList vehicles={vehicles} />
      ) : (
        <>
            {auth.role === 'owner' && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold text-foreground">No vehicles yet!</h3>
                    <p className="text-muted-foreground mt-2">The functionality to add vehicles will be coming soon.</p>
                </div>
            )}
            {(auth.role === 'dealer' || auth.role === 'reseller' || auth.role === 'insurance') && (
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Link2Off />
                            Waiting for Access
                        </CardTitle>
                        <CardDescription>
                           {auth.role === 'insurance'
                                ? "To view a vehicle's claim details, its owner must grant you access and the vehicle must be marked as 'in_claim'."
                                : "To view and manage a vehicle, its owner must grant you access by having you scan a unique QR code from their app."
                           }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Once an owner grants you permission and the vehicle meets the criteria for your role, it will automatically appear on your dashboard. There is no further action required on your part.</p>
                    </CardContent>
                </Card>
            )}
        </>
      )}
    </div>
  );
}
