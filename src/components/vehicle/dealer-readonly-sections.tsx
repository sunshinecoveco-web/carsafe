"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/supabase";
import type { Vehicle } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Building2, CalendarDays, Gauge, ShieldCheck, Wrench } from "lucide-react";

interface VehicleFlagRow {
  id: string;
  flag_type: string;
  description: string;
  created_at: string;
  visibility: string;
}

interface PolicyRow {
  id: string;
  policy_number: string;
  cover_type: string;
  inception_date: string | null;
  insurer_reference: string | null;
  insurer_id: string | null;
}

interface ServiceLogRow {
  id: string;
  service_date: string;
  description: string;
  category: string | null;
  mileage_at_service: number | null;
  workshop: string | null;
  dealer_id: string | null;
  status: string | null;
  notes: string | null;
}

interface DealerReadonlySectionsProps {
  vehicle: Vehicle;
  canViewPolicy: boolean;
}

export function DealerReadonlySections({ vehicle, canViewPolicy }: DealerReadonlySectionsProps) {
  const [flags, setFlags] = useState<VehicleFlagRow[]>([]);
  const [policy, setPolicy] = useState<PolicyRow | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [{ data: flagData, error: flagError }, { data: policyData, error: policyError }, { data: serviceData, error: serviceError }] = await Promise.all([
          supabase.from("vehicle_flags").select("id, flag_type, description, created_at, visibility").eq("vehicle_id", vehicle.id).eq("visibility", "external").order("created_at", { ascending: false }),
          canViewPolicy
            ? supabase.from("vehicle_policies").select("id, policy_number, cover_type, inception_date, insurer_reference, insurer_id").eq("vehicle_id", vehicle.id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          supabase.from("service_logs").select("id, service_date, description, category, mileage_at_service, workshop, dealer_id, status, notes").eq("vehicle_id", vehicle.id).order("service_date", { ascending: false }),
        ]);

        if (!isMounted) return;

        if (!flagError) setFlags((flagData ?? []) as VehicleFlagRow[]);
        if (!policyError) setPolicy((policyData as PolicyRow | null) ?? null);
        if (!serviceError) setServiceHistory((serviceData ?? []) as ServiceLogRow[]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void load();
    return () => { isMounted = false; };
  }, [canViewPolicy, vehicle.id]);

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <Card className="border-amber-200/60 bg-amber-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-700" />
            <div>
              <CardTitle className="text-base">External Flags</CardTitle>
              <CardDescription>Read-only insurer notes shared with dealers and workshops.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading flags…</div>
          ) : flags.length === 0 ? (
            <div className="rounded-lg border border-dashed border-amber-200 bg-background/70 p-3 text-sm text-muted-foreground">
              No external flags have been recorded for this vehicle.
            </div>
          ) : (
            <div className="space-y-3">
              {flags.map((flag) => (
                <div key={flag.id} className="rounded-lg border border-amber-200/70 bg-background/70 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{flag.flag_type}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{flag.description}</p>
                    </div>
                    <Badge variant="outline" className="whitespace-nowrap">
                      {formatDate(flag.created_at)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200/60 bg-blue-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-700" />
            <div>
              <CardTitle className="text-base">Policy Details</CardTitle>
              <CardDescription>Read-only insurance policy information for this vehicle.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!canViewPolicy ? (
            <div className="rounded-lg border border-dashed border-blue-200 bg-background/70 p-3 text-sm text-muted-foreground">
              Policy details are not available until the owner grants dealer service access.
            </div>
          ) : !policy ? (
            <div className="rounded-lg border border-dashed border-blue-200 bg-background/70 p-3 text-sm text-muted-foreground">
              No linked policy is available for this vehicle.
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Policy number</p>
                  <p className="font-medium text-foreground">{policy.policy_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cover type</p>
                  <p className="font-medium text-foreground">{policy.cover_type}</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Inception date</p>
                  <p className="font-medium text-foreground">{formatDate(policy.inception_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Insurer reference</p>
                  <p className="font-medium text-foreground">{policy.insurer_reference || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-green-200/60 bg-green-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-green-700" />
            <div>
              <CardTitle className="text-base">Service History</CardTitle>
              <CardDescription>Chronological service and repair records across all parties.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading service history…</div>
          ) : serviceHistory.length === 0 ? (
            <div className="rounded-lg border border-dashed border-green-200 bg-background/70 p-3 text-sm text-muted-foreground">
              No service history has been logged for this vehicle yet.
            </div>
          ) : (
            <div className="space-y-3">
              {serviceHistory.map((record) => (
                <div key={record.id} className="rounded-lg border border-green-200/70 bg-background/70 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{formatDate(record.service_date)}</p>
                      <p className="text-sm text-muted-foreground">{record.category || "Service Record"}</p>
                    </div>
                    <Badge variant="outline" className="whitespace-nowrap">
                      {record.status || "Completed"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-foreground">{record.description || record.notes || "No service details provided."}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {record.mileage_at_service != null && (
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5" />
                        {record.mileage_at_service.toLocaleString()} km
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {record.workshop || record.dealer_id ? "Logged" : "Logged"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
