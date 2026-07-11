"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/supabase";
import type { Vehicle } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Gauge, Loader2, Wrench } from "lucide-react";

interface ServiceLogRow {
  id: string;
  service_date: string;
  description: string;
  notes?: string | null;
  workshop?: string | null;
  mileage_at_service?: number | null;
  category?: string | null;
  dealer_id?: string | null;
  status?: string | null;
  loggedBy?: string;
}

interface InsurerServiceHistoryCardProps {
  vehicle: Vehicle;
}

export function InsurerServiceHistoryCard({ vehicle }: InsurerServiceHistoryCardProps) {
  const [records, setRecords] = useState<ServiceLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRecords = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("service_logs")
        .select("id, service_date, description, notes, workshop, mileage_at_service, category, dealer_id, status")
        .eq("vehicle_id", vehicle.id)
        .order("service_date", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setRecords([]);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as ServiceLogRow[];
      const enriched = await Promise.all(
        rows.map(async (row) => {
          let loggedBy = row.workshop?.trim() || "Workshop";

          if (row.dealer_id) {
            const { data: dealerData, error: dealerError } = await supabase
              .from("dealer_profiles")
              .select("id, dealership_name")
              .eq("id", row.dealer_id)
              .maybeSingle();

            if (!dealerError && dealerData?.dealership_name) {
              loggedBy = dealerData.dealership_name;
            }
          }

          return { ...row, loggedBy };
        })
      );

      if (isMounted) {
        setRecords(enriched);
        setLoading(false);
      }
    };

    void loadRecords();

    return () => {
      isMounted = false;
    };
  }, [vehicle.id]);

  return (
    <Card className="border-blue-200/60 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-blue-700" />
          <div>
            <CardTitle className="text-base">Service History</CardTitle>
            <CardDescription>Read-only service and repair records for this vehicle.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading service history…
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-lg border border-dashed border-blue-200 bg-background/70 p-3 text-sm text-muted-foreground">
            No service history has been logged for this vehicle yet.
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="rounded-lg border border-blue-200/70 bg-background/70 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {record.service_date
                        ? new Date(record.service_date).toLocaleDateString("en-ZA", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Unknown date"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {record.category || "Service Record"}
                    </p>
                  </div>
                  <Badge variant="outline" className="whitespace-nowrap">
                    {record.status || "Completed"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-foreground">
                  {record.description || record.notes || "No service details provided."}
                </p>
                {(record.notes && record.notes !== record.description) && (
                  <p className="mt-1 text-xs text-muted-foreground">{record.notes}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {record.mileage_at_service != null && (
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3.5 w-3.5" />
                      {record.mileage_at_service.toLocaleString()} km
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {record.loggedBy || "Workshop"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
