"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabase";
import type { Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Flag, Pencil, PlusCircle } from "lucide-react";

interface VehicleFlag {
  id: string;
  vehicle_id: string;
  insurer_id: string;
  flag_type: string;
  description: string;
  visibility: "internal" | "external";
  created_at: string;
}

interface InsurerFlagsCardProps {
  vehicle: Vehicle;
  userRole: string | null;
  userId: string | null;
  canAddFlag?: boolean;
}

export function InsurerFlagsCard({ vehicle, userRole, userId, canAddFlag = false }: InsurerFlagsCardProps) {
  const { toast } = useToast();
  const [flags, setFlags] = useState<VehicleFlag[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingFlag, setEditingFlag] = useState<VehicleFlag | null>(null);
  const [formState, setFormState] = useState({
    flagType: "Fraud Indicator",
    description: "",
    visibility: "internal" as "internal" | "external",
  });

  const visibleFlags = useMemo(() => {
    if (userRole === "insurance") {
      return flags;
    }
    return flags.filter((flag) => flag.visibility === "external");
  }, [flags, userRole]);

  const fetchFlags = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicle_flags")
      .select("*")
      .eq("vehicle_id", vehicle.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setFlags((data ?? []) as VehicleFlag[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFlags();
  }, [vehicle.id]);

  const openEditor = (flag: VehicleFlag) => {
    setEditingFlag(flag);
    setFormState({
      flagType: flag.flag_type,
      description: flag.description,
      visibility: flag.visibility,
    });
    setOpen(true);
  };

  const resetForm = () => {
    setEditingFlag(null);
    setFormState({ flagType: "Fraud Indicator", description: "", visibility: "internal" });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canAddFlag || !userId) return;

    setSubmitting(true);

    if (editingFlag) {
      const { data, error } = await supabase
        .from("vehicle_flags")
        .update({
          flag_type: formState.flagType,
          description: formState.description.trim(),
          visibility: formState.visibility,
        })
        .eq("id", editingFlag.id)
        .select()
        .single();

      setSubmitting(false);

      if (error) {
        toast({ variant: "destructive", title: "Unable to update flag", description: error.message });
        return;
      }

      if (data) {
        setFlags((prev) => prev.map((flag) => (flag.id === data.id ? (data as VehicleFlag) : flag)));
        setEditingFlag(null);
        setOpen(false);
        setFormState({ flagType: "Fraud Indicator", description: "", visibility: "internal" });
        toast({ title: "Flag updated", description: "Changes have been saved." });
      }
      return;
    }

    const { data, error } = await supabase
      .from("vehicle_flags")
      .insert({
        vehicle_id: vehicle.id,
        insurer_id: userId,
        flag_type: formState.flagType,
        description: formState.description.trim(),
        visibility: formState.visibility,
      })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      toast({ variant: "destructive", title: "Unable to add flag", description: error.message });
      return;
    }

    if (data) {
      setFlags((prev) => [data as VehicleFlag, ...prev]);
      setOpen(false);
      setFormState({ flagType: "Fraud Indicator", description: "", visibility: "internal" });
      toast({ title: "Flag added", description: "The new flag has been saved to this vehicle record." });
    }
  };

  return (
    <Card className="border-amber-200/60 bg-amber-50/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-amber-600" />
            <CardTitle className="text-base">Vehicle Flags</CardTitle>
          </div>
          <Dialog open={open} onOpenChange={(value) => {
            setOpen(value);
            if (!value) resetForm();
          }}>
            {canAddFlag && (
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Flag
                </Button>
              </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingFlag ? "Edit Flag" : "Add Flag"}</DialogTitle>
                <DialogDescription>
                  Record a fraud indicator, claim alert, anomaly, or general note for this vehicle.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="flagType">Flag Type</Label>
                  <select
                    id="flagType"
                    value={formState.flagType}
                    onChange={(event) => setFormState((prev) => ({ ...prev, flagType: event.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Fraud Indicator">Fraud Indicator</option>
                    <option value="Claim Alert">Claim Alert</option>
                    <option value="Anomaly">Anomaly</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Add details for the insurer team or downstream partners."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <select
                    id="visibility"
                    value={formState.visibility}
                    onChange={(event) => setFormState((prev) => ({ ...prev, visibility: event.target.value as "internal" | "external" }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="internal">Internal Only</option>
                    <option value="external">Visible to Dealers & Workshops</option>
                  </select>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting || !formState.description.trim()}>
                    {submitting ? "Saving…" : editingFlag ? "Save Changes" : "Save Flag"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading flags…</div>
        ) : visibleFlags.length === 0 ? (
          <div className="flex items-start gap-2 rounded-lg border border-dashed border-amber-200 bg-background/70 p-3 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>No flags recorded for this vehicle yet.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleFlags.map((flag) => {
              const canEditFlag = userRole === "insurance" && userId && flag.insurer_id === userId;
              return (
                <div key={flag.id} className="rounded-lg border border-amber-200/80 bg-background/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{flag.flag_type}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{flag.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                        {flag.visibility === "internal" ? "Internal" : "External"}
                      </span>
                      {canEditFlag && (
                        <Button
                          size="sm"
                          variant="ghost"
                          type="button"
                          onClick={() => openEditor(flag)}
                          className="h-9 px-2"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
