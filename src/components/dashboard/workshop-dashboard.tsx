"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getVehicles } from "@/lib/data";
import type { Vehicle } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Car, Wrench, BadgeCheck } from "lucide-react";

interface WorkshopDashboardProps {
  userId: string;
}

function statusLabel(status: Vehicle["status"]) {
  if (status === "in_claim") return "In Claim";
  if (status === "for_sale") return "For Sale";
  return "Checked In";
}

function statusVariant(status: Vehicle["status"]) {
  if (status === "in_claim") return "destructive" as const;
  if (status === "for_sale") return "secondary" as const;
  return "outline" as const;
}

export function WorkshopDashboard({ userId }: WorkshopDashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVehicles()
      .then(setVehicles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const workshopName = userId === "032bccbd-e329-45e7-8f22-fc27692704c2"
    ? "Northside Auto Workshop"
    : "Workshop";

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Workshop Portal
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{workshopName}</h1>
            <Badge className="bg-amber-600 text-white flex items-center gap-1 px-2.5 py-1">
              <BadgeCheck className="h-3.5 w-3.5" />
              Service Bay
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Vehicles currently checked in for service and repair.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Checked In Vehicles</h2>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
                No vehicles are currently checked in for workshop work.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading &&
          vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="border border-border transition-all hover:shadow-sm hover:border-primary/30">
              <CardContent className="py-4 px-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Wrench className="h-5 w-5 text-amber-600" />
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
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={statusVariant(vehicle.status)} className="text-xs">
                      {statusLabel(vehicle.status)}
                    </Badge>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                        View Vehicle
                        <ArrowRight className="ml-2 h-4 w-4" />
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
