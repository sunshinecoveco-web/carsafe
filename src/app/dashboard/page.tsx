"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getVehicles } from "@/lib/data";
import { VehicleList } from "@/components/dashboard/vehicle-list";
import { DealerDashboard } from "@/components/dashboard/dealer-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Shield, Tag } from "lucide-react";
import { AddVehicleDialog } from "@/components/vehicle/add-vehicle-dialog";

export default function DashboardPage() {
  const auth = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicles()
      .then((v) => setVehicles(v))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !auth.isAuthenticated) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (auth.role === "dealer") {
    const assigned = vehicles.filter((v) =>
      v.approvedDealerIds?.includes(auth.userId!)
    );
    return <DealerDashboard vehicles={assigned} dealerId={auth.userId!} />;
  }

  if (auth.role === "insurance") {
    const assigned = vehicles.filter((v) =>
      v.approvedInsuranceIds?.includes(auth.userId!)
    );
    return (
      <div className="container py-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Insurance Portal
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Claim Vehicles
            </h1>
            <p className="mt-1 text-muted-foreground">
              {assigned.length} vehicle{assigned.length !== 1 ? "s" : ""} assigned for claim review
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Read-Only Access</span>
          </div>
        </div>
        <VehicleList vehicles={assigned} />
      </div>
    );
  }

  if (auth.role === "reseller") {
    const assigned = vehicles.filter((v) =>
      v.approvedResellerIds?.includes(auth.userId!)
    );
    return (
      <div className="container py-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Reseller Portal
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Vehicles for Sale
            </h1>
            <p className="mt-1 text-muted-foreground">
              {assigned.length} vehicle{assigned.length !== 1 ? "s" : ""} available to resell
            </p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Reseller Account
          </Badge>
        </div>
        <VehicleList vehicles={assigned} />
      </div>
    );
  }

  // Owner view
  const handleVehicleAdded = (vehicle: Vehicle) => {
    setVehicles((prev) => [vehicle, ...prev]);
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Vehicles</h1>
          <p className="mt-1 text-muted-foreground">
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} in your fleet
          </p>
        </div>
        <AddVehicleDialog ownerId={auth.userId!} onVehicleAdded={handleVehicleAdded} />
      </div>
      <VehicleList vehicles={vehicles} />
    </div>
  );
}
