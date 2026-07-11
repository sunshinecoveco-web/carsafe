"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface PendingLinkRequest { 
  id: string;
  vehicle_id: string;
  insurer_id: string;
  owner_id: string;
  status: string;
  created_at: string;
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    registration_number?: string | null;
    status?: string;
  } | null;
  insurerName?: string;
}

interface VehicleRow {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  registration_number?: string | null;
  status?: string;
}

interface InsurerRow {
  id: string;
  name?: string | null;
  email?: string | null;
}

export function OwnerPendingRequests() {
  const auth = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PendingLinkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingRequestId, setActingRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated || auth.role !== "owner" || !auth.userId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("vehicle_link_requests")
        .select("*")
        .eq("owner_id", auth.userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        if (isMounted) {
          setRequests([]);
          setLoading(false);
          toast({ variant: "destructive", title: "Unable to load requests", description: error.message });
        }
        return;
      }

      const rows = (data ?? []) as PendingLinkRequest[];
      const hydrated: PendingLinkRequest[] = [];

      for (const row of rows) {
        const [vehicleRes, insurerRes] = await Promise.all([
          supabase
            .from("vehicles")
            .select("id, make, model, year, vin, registration_number, status")
            .eq("id", row.vehicle_id)
            .maybeSingle(),
          supabase
            .from("users")
            .select("id, name, email")
            .eq("id", row.insurer_id)
            .maybeSingle(),
        ]);

        const vehicle = (vehicleRes.data as VehicleRow | null) ?? null;
        const insurer = (insurerRes.data as InsurerRow | null) ?? null;

        if (isMounted) {
          hydrated.push({
            ...row,
            vehicle: vehicle
              ? {
                  id: vehicle.id,
                  make: vehicle.make,
                  model: vehicle.model,
                  year: vehicle.year,
                  vin: vehicle.vin,
                  registration_number: vehicle.registration_number,
                  status: vehicle.status,
                }
              : null,
            insurerName: insurer?.name?.trim() || insurer?.email || "Insurer",
          });
        }
      }

      if (isMounted) {
        setRequests(hydrated);
        setLoading(false);
      }
    };

    void loadRequests();

    return () => {
      isMounted = false;
    };
  }, [auth.isAuthenticated, auth.role, auth.userId, toast]);

  const handleAction = async (request: PendingLinkRequest, action: "approve" | "reject") => {
    if (!auth.userId) return;

    setActingRequestId(request.id);

    try {
      if (action === "approve") {
        const { error: requestError } = await supabase
          .from("vehicle_link_requests")
          .update({ status: "approved" })
          .eq("id", request.id);

        if (requestError) throw requestError;

        const { error: vehicleError } = await supabase
          .from("vehicles")
          .update({ owner_id: auth.userId })
          .eq("id", request.vehicle_id);

        if (vehicleError) throw vehicleError;

        toast({ title: "Request approved", description: "The vehicle has been linked to your account." });
      } else {
        const { error } = await supabase
          .from("vehicle_link_requests")
          .update({ status: "rejected" })
          .eq("id", request.id);

        if (error) throw error;

        toast({ title: "Request rejected", description: "The link request has been dismissed." });
      }

      setRequests((prev) => prev.filter((item) => item.id !== request.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({ variant: "destructive", title: "Unable to update request", description: message });
    } finally {
      setActingRequestId(null);
    }
  };

  if (!auth.isAuthenticated || auth.role !== "owner") {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Pending Requests</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Review insurer link requests that are waiting for your approval.
            </p>
          </div>
          <Badge variant="secondary">{requests.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading requests…
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No pending requests right now.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="rounded-lg border border-border bg-background/70 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                      {request.vehicle?.make} {request.vehicle?.model}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {request.vehicle?.registration_number || request.vehicle?.vin}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Insurer: {request.insurerName || "Insurer"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleAction(request, "reject")}
                      disabled={actingRequestId === request.id}
                    >
                      {actingRequestId === request.id ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Working…</>
                      ) : (
                        <><XCircle className="mr-2 h-4 w-4" />Reject</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => void handleAction(request, "approve")}
                      disabled={actingRequestId === request.id}
                    >
                      {actingRequestId === request.id ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Working…</>
                      ) : (
                        <><CheckCircle2 className="mr-2 h-4 w-4" />Approve</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
