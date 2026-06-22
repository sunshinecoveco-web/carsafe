"use client";

import { useEffect, useState } from "react";
import { getDealerVehicles } from "@/lib/dealer";
import type { DealerProfile, DealerVehicle } from "@/lib/dealer";
import { DealerAddVehicleDialog } from "@/components/dealer/add-vehicle-dialog";
import { AddServiceRecordDialog } from "@/components/dealer/add-service-record-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Car,
  ShieldCheck,
  Tag,
  Wrench,
} from "lucide-react";

function statusLabel(s: DealerVehicle["status"]) {
  if (s === "for_sale") return "For Sale";
  if (s === "in_claim") return "In Claim";
  return "Active";
}

function statusVariant(s: DealerVehicle["status"]) {
  if (s === "for_sale") return "secondary" as const;
  if (s === "in_claim") return "destructive" as const;
  return "outline" as const;
}

interface DealerDashboardProps {
  profile: DealerProfile;
}

export function DealerDashboard({ profile }: DealerDashboardProps) {
  const [vehicles, setVehicles] = useState<DealerVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    getDealerVehicles(profile.id)
      .then(setVehicles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profile.id, refreshKey]);

  const refresh = () => setRefreshKey(k => k + 1);

  const forSale = vehicles.filter(v => v.status === "for_sale").length;

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Dealer Portal
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">
              {profile.dealershipName}
            </h1>
            {profile.isVerified ? (
              <Badge className="bg-blue-600 text-white flex items-center gap-1 px-2.5 py-1">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified Dealer
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Pending Verification
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile.contactEmail} · {profile.contactNumber}
          </p>
        </div>
        <DealerAddVehicleDialog profile={profile} onVehicleLinked={refresh} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="h-4 w-4 text-primary" />
              </div>
              <div>
                {loading ? <Skeleton className="h-8 w-8 mb-1" /> : <p className="text-2xl font-bold">{vehicles.length}</p>}
                <p className="text-xs text-muted-foreground">Total Vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Tag className="h-4 w-4 text-green-600" />
              </div>
              <div>
                {loading ? <Skeleton className="h-8 w-8 mb-1" /> : <p className="text-2xl font-bold">{forSale}</p>}
                <p className="text-xs text-muted-foreground">For Sale</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold truncate">{profile.registrationNumber}</p>
                <p className="text-xs text-muted-foreground">Reg. Number</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle list */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">My Fleet</h2>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        )}

        {!loading && vehicles.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Car className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No vehicles yet. Use <strong>Add Vehicle</strong> to search for an existing vehicle
                or create a new listing.
              </p>
              <DealerAddVehicleDialog profile={profile} onVehicleLinked={refresh}>
                {/* inherits the default trigger */}
              </DealerAddVehicleDialog>
            </CardContent>
          </Card>
        )}

        {!loading &&
          vehicles.map(vehicle => (
            <Card
              key={vehicle.id}
              className="border border-border transition-all hover:shadow-sm hover:border-primary/30"
            >
              <CardContent className="py-4 px-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {vehicle.registrationNumber && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {vehicle.registrationNumber}
                          </span>
                        )}
                        {vehicle.colour && (
                          <span className="text-xs text-muted-foreground">· {vehicle.colour}</span>
                        )}
                        {vehicle.mileage != null && (
                          <span className="text-xs text-muted-foreground">
                            · {vehicle.mileage.toLocaleString()} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <Badge variant={statusVariant(vehicle.status)} className="text-xs">
                        {statusLabel(vehicle.status)}
                      </Badge>
                      {vehicle.askingPrice != null && (
                        <span className="text-xs font-semibold text-green-600">
                          R{vehicle.askingPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <AddServiceRecordDialog
                      profile={profile}
                      vehicle={vehicle}
                      onRecordAdded={refresh}
                    />

                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
