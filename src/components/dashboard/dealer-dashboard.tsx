"use client";

import type { Vehicle } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Car,
  Wrench,
  TrendingUp,
  AlertTriangle,
  Tag,
  ArrowRight,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

function estimateValue(vehicle: Vehicle): number {
  const currentYear = 2025;
  const age = currentYear - vehicle.year;
  const baseValues: Record<string, number> = {
    BMW: 650000,
    "Mercedes-Benz": 700000,
    Toyota: 420000,
    Volkswagen: 380000,
    Ford: 360000,
    Isuzu: 480000,
    Hyundai: 300000,
    Kia: 280000,
    Mazda: 380000,
    Nissan: 350000,
    Suzuki: 240000,
    Haval: 320000,
    Chery: 300000,
  };
  const base = baseValues[vehicle.make] ?? 350000;
  const depreciated = base * Math.pow(0.85, age);
  const serviceBonus = vehicle.serviceHistory.length * 3000;
  return Math.round((depreciated + serviceBonus) / 1000) * 1000;
}

function formatValue(value: number): string {
  return `R${(value / 1000).toFixed(0)}k`;
}

function getDaysUntilNextService(vehicle: Vehicle): number | null {
  const lastService = vehicle.serviceHistory[0];
  if (!lastService) return null;
  const lastDate = new Date(lastService.date);
  const nextDate = new Date(lastDate);
  nextDate.setMonth(nextDate.getMonth() + 6);
  const today = new Date(2025, 4, 27);
  return Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

interface DealerDashboardProps {
  vehicles: Vehicle[];
  dealerId: string;
}

export function DealerDashboard({ vehicles, dealerId }: DealerDashboardProps) {
  const forSale = vehicles.filter((v) => v.status === "for_sale");
  const inClaim = vehicles.filter((v) => v.status === "in_claim");
  const servicesDue = vehicles.filter((v) => {
    const days = getDaysUntilNextService(v);
    return days !== null && days <= 30;
  });

  const totalFleetValue = vehicles.reduce(
    (sum, v) => sum + estimateValue(v),
    0
  );

  return (
    <div className="container py-8 space-y-8">
      {/* Dealer Portal Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Dealer Portal
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Fleet Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Managing {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} •{" "}
            Dealer ID:{" "}
            <span className="font-mono text-xs">{dealerId}</span>
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          Verified Dealer
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicles.length}</p>
                <p className="text-xs text-muted-foreground">Total Fleet</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Wrench className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{servicesDue.length}</p>
                <p className="text-xs text-muted-foreground">Service Due</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Tag className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{forSale.length}</p>
                <p className="text-xs text-muted-foreground">For Sale</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  R{(totalFleetValue / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-muted-foreground">Est. Fleet Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fleet & Valuation */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Vehicle Fleet */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Assigned Vehicles</h2>
          <div className="space-y-3">
            {vehicles.map((vehicle) => {
              const value = estimateValue(vehicle);
              const daysUntilService = getDaysUntilNextService(vehicle);
              const serviceSoon =
                daysUntilService !== null && daysUntilService <= 30;
              return (
                <Link
                  key={vehicle.id}
                  href={`/dashboard/vehicles/${vehicle.id}`}
                  className="group block"
                >
                  <Card className="border border-border bg-card transition-all duration-200 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5">
                    <CardContent className="py-4 px-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Car className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">
                              {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {vehicle.vin}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-green-600">
                              {formatValue(value)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              est. value
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant={
                                vehicle.status === "for_sale"
                                  ? "secondary"
                                  : vehicle.status === "in_claim"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {vehicle.status === "for_sale"
                                ? "For Sale"
                                : vehicle.status === "in_claim"
                                ? "In Claim"
                                : "Active"}
                            </Badge>
                            {serviceSoon && (
                              <Badge
                                variant="outline"
                                className="text-xs text-orange-600 border-orange-300"
                              >
                                <Wrench className="h-2.5 w-2.5 mr-1" />
                                Service Due
                              </Badge>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Valuation & Pricing Panel */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Valuation Summary</h2>
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Fleet Pricing Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">
                      {vehicle.year} {vehicle.make}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {vehicle.model}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-bold text-green-600">
                      {formatValue(estimateValue(vehicle))}
                    </p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
                * Estimated values based on age, make, and service history.
                Open a vehicle to use AI-powered analysis.
              </p>
            </CardContent>
          </Card>

          {inClaim.length > 0 && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Active Claims ({inClaim.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {inClaim.map((v) => (
                  <div key={v.id} className="flex items-center justify-between">
                    <p className="text-xs font-medium">
                      {v.make} {v.model}
                    </p>
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                      <Link href={`/dashboard/vehicles/${v.id}`}>Review</Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {servicesDue.length > 0 && (
            <Card className="border-orange-300/50 bg-orange-50/50 dark:bg-orange-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-600">
                  <Wrench className="h-4 w-4" />
                  Service Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {servicesDue.map((v) => (
                  <div key={v.id} className="flex items-center justify-between">
                    <p className="text-xs font-medium">
                      {v.make} {v.model}
                    </p>
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                      <Link href={`/dashboard/vehicles/${v.id}`}>Schedule</Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="border-green-300/50 bg-green-50/50 dark:bg-green-900/10">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-xs font-semibold">Dealer Verified</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Your account is verified. You can add and edit service records
                for all assigned vehicles.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
