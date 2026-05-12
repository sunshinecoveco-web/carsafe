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
  </div>
);

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  useEffect(() => {
    async function loadVehicles() {
      try {
        const data = await getVehicles();
        setVehicles(data);
      } catch (error) {
        console.error('Failed to load vehicles:', error);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your vehicles and track maintenance
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <VehicleList vehicles={vehicles} />
        
        {vehicles.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <UpcomingServices vehicles={vehicles} />
              <ServiceProgress vehicles={vehicles} />
            </div>
            
            <CostOfOwnershipChart vehicles={vehicles} />
          </>
        )}

        {vehicles.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Vehicles Found</CardTitle>
              <CardDescription>
                Get started by adding your first vehicle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Link2Off className="h-12 w-12 mr-4" />
                <p>Add a vehicle to see your dashboard</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
