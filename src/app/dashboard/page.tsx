"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getVehicles } from "@/lib/data";
import { getDealerProfile } from "@/lib/dealer";
import { getResellerProfile } from "@/lib/reseller";
import { VehicleList } from "@/components/dashboard/vehicle-list";
import { DealerDashboard } from "@/components/dashboard/dealer-dashboard";
import { ResellerDashboard } from "@/components/dashboard/reseller-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle } from "@/lib/types";
import type { DealerProfile } from "@/lib/dealer";
import type { ResellerProfile } from "@/lib/reseller";
import { Shield } from "lucide-react";
import { AddVehicleDialog } from "@/components/vehicle/add-vehicle-dialog";
import { InsurerAddVehicleDialog } from "@/components/insurance/insurer-add-vehicle-dialog";
import { OwnerPendingRequests } from "@/components/dashboard/owner-pending-requests";

export default function DashboardPage() {
  const auth = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dealerProfile, setDealerProfile] = useState<DealerProfile | null | undefined>(undefined);
  const [resellerProfile, setResellerProfile] = useState<ResellerProfile | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const handleVehicleAdded = (vehicle: Vehicle) => {
    setVehicles((prev) => [vehicle, ...prev]);
  };

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    if (auth.role === "dealer") {
      getDealerProfile(auth.userId!)
        .then(profile => {
          if (!profile) {
            router.push("/dealer/setup");
          } else {
            setDealerProfile(profile);
            setLoading(false);
          }
        })
        .catch(console.error);
      return;
    }

    if (auth.role === "reseller") {
      getResellerProfile(auth.userId!)
        .then(profile => {
          if (!profile) {
            router.push("/reseller/setup");
          } else {
            setResellerProfile(profile);
            setLoading(false);
          }
        })
        .catch(console.error);
      return;
    }

    getVehicles()
      .then((v) => setVehicles(v))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [auth.isAuthenticated, auth.role, auth.userId, router]);

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
    if (!dealerProfile) return null; // redirecting to /dealer/setup
    return <DealerDashboard profile={dealerProfile} />;
  }

  if (auth.role === "reseller") {
    if (!resellerProfile) return null; // redirecting to /reseller/setup
    return <ResellerDashboard profile={resellerProfile} />;
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
          <InsurerAddVehicleDialog userId={auth.userId!} onVehicleAdded={handleVehicleAdded} />
        </div>
        <VehicleList vehicles={assigned} />
      </div>
    );
  }

  // Owner view
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
      <OwnerPendingRequests />
      <VehicleList vehicles={vehicles} />
    </div>
  );
}
