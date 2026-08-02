"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabase";
import { buildVehicleFlagInsertPayload } from "@/lib/vehicle-flags";
import { Flag, Loader2, Search } from "lucide-react";

interface FlagVehicleByVinDialogProps {
  userId: string;
}

interface VehicleMatch {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  registration_number: string | null;
}

export function FlagVehicleByVinDialog({ userId }: FlagVehicleByVinDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [vin, setVin] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [foundVehicle, setFoundVehicle] = useState<VehicleMatch | null>(null);

  const resetForm = () => {
    setVin("");
    setDescription("");
    setServerError(null);
    setFoundVehicle(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resetForm();
    }
    setOpen(next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedVin = vin.trim().toUpperCase();

    if (!normalizedVin) {
      setServerError("Enter a VIN to continue.");
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const { data: vehicle, error: lookupError } = await supabase
        .from("vehicles")
        .select("id, make, model, year, vin, registration_number")
        .ilike("vin", normalizedVin)
        .maybeSingle();

      if (lookupError) {
        throw lookupError;
      }

      if (!vehicle) {
        setFoundVehicle(null);
        setServerError("No vehicle was found for that VIN.");
        return;
      }

      setFoundVehicle(vehicle as VehicleMatch);

      const payload = buildVehicleFlagInsertPayload(vehicle.id, userId, description.trim() || `Flagged by insurer via VIN lookup for ${vehicle.vin}.`);

      const { error: flagError } = await supabase
        .from("vehicle_flags")
        .insert(payload);

      if (flagError) {
        throw flagError;
      }

      toast({
        title: "Vehicle flagged",
        description: `${vehicle.make} ${vehicle.model} (${vehicle.year}) has been flagged for external review.`,
      });

      resetForm();
      setOpen(false);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unable to add the flag right now.";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Flag className="mr-2 h-4 w-4" />
          Flag Vehicle by VIN
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Flag Vehicle by VIN</DialogTitle>
          <DialogDescription>
            Search any vehicle in the system by VIN and add an external insurer flag for testing or review.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="vin">VIN</Label>
            <Input
              id="vin"
              value={vin}
              onChange={(event) => setVin(event.target.value)}
              placeholder="1HGBH41JXMN109186"
              className="font-mono uppercase"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Flag Details</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a note for the external review team."
            />
          </div>

          {foundVehicle && (
            <Alert>
              <AlertDescription>
                Matching vehicle: {foundVehicle.make} {foundVehicle.model} ({foundVehicle.year}) · {foundVehicle.vin}
              </AlertDescription>
            </Alert>
          )}

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Searching…</>
              ) : (
                <><Search className="mr-2 h-4 w-4" />Flag Vehicle</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
