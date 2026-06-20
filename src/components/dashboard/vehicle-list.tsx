import type { Vehicle } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { ArrowRight, Car, Wrench, Palette } from "lucide-react";

function getStatusVariant(status: Vehicle['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'for_sale') return 'secondary';
  if (status === 'in_claim') return 'destructive';
  return 'outline';
}

function getStatusLabel(status: Vehicle['status']): string {
  if (status === 'for_sale') return 'For Sale';
  if (status === 'in_claim') return 'In Claim';
  return 'Active';
}

export function VehicleList({ vehicles }: { vehicles: Vehicle[] }) {
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Car className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No vehicles yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Your vehicles will appear here once added.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => {
        const lastService = vehicle.serviceHistory?.[0];
        return (
          <Link key={vehicle.id} href={`/dashboard/vehicles/${vehicle.id}`} className="group block">
            <Card className="h-full border border-border bg-card transition-all duration-200 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate leading-tight">
                        {vehicle.make} {vehicle.model}
                      </p>
                      {vehicle.registrationNumber ? (
                        <p className="text-xs font-medium text-foreground/70 mt-0.5 truncate">
                          {vehicle.registrationNumber}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                          {vehicle.vin}
                        </p>
                      )}
                      {vehicle.colour && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Palette className="h-3 w-3 flex-shrink-0" />
                          {vehicle.colour}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0 text-xs">
                    {vehicle.year}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={getStatusVariant(vehicle.status)} className="text-xs">
                      {getStatusLabel(vehicle.status)}
                    </Badge>
                    {lastService && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Wrench className="h-3 w-3" />
                        {new Date(lastService.date).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
