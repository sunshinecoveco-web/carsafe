"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabase";
import type { Vehicle } from "@/lib/types";
import { Loader2, PlusCircle } from "lucide-react";

const currentYear = new Date().getFullYear();

const schema = z.object({
  vin: z.string().trim().min(1, "Required"),
  registrationNumber: z.string().trim().min(1, "Required"),
  make: z.string().trim().min(1, "Required"),
  model: z.string().trim().min(1, "Required"),
  year: z.coerce.number({ invalid_type_error: "Enter a valid year" }).int().min(1900).max(currentYear + 1),
  colour: z.string().trim().optional().or(z.literal("")),
  mileage: z.coerce.number({ invalid_type_error: "Enter a valid number" }).int().min(0).optional().or(z.literal("")),
  policyNumber: z.string().trim().min(1, "Required"),
  coverType: z.enum(["Comprehensive", "Third Party", "Third Party Fire & Theft"]),
  inceptionDate: z.string().trim().optional().or(z.literal("")),
  premiumAmount: z.coerce.number({ invalid_type_error: "Enter a valid amount" }).min(0).optional().or(z.literal("")),
  insurerReferenceNumber: z.string().trim().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface InsurerAddVehicleDialogProps {
  userId: string;
  onVehicleAdded?: (vehicle: Vehicle) => void;
}

export function InsurerAddVehicleDialog({ userId, onVehicleAdded }: InsurerAddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      year: currentYear,
      mileage: 0,
      coverType: "Comprehensive",
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      setServerError(null);
    }
    setOpen(next);
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const vin = values.vin.trim().toUpperCase();
      const { data: existingVehicle, error: duplicateError } = await supabase
        .from("vehicles")
        .select("id")
        .ilike("vin", vin)
        .maybeSingle();

      if (duplicateError) {
        throw duplicateError;
      }

      if (existingVehicle) {
        setServerError("A vehicle with this VIN already exists. Please use a unique VIN.");
        return;
      }

      const { data: vehicleRow, error: vehicleError } = await supabase
        .from("vehicles")
        .insert({
          owner_id: null,
          make: values.make.trim(),
          model: values.model.trim(),
          year: values.year,
          registration_number: values.registrationNumber.trim(),
          vin,
          colour: values.colour?.trim() || null,
          mileage: values.mileage ?? 0,
          status: "insurer_added",
          image_url: "",
          approved_insurance_ids: [userId],
          allow_dealer_service_access: false,
          allow_reseller_access: false,
          allow_insurance_access: true,
        })
        .select()
        .single();

      if (vehicleError) {
        throw vehicleError;
      }

      const { error: policyError } = await supabase.from("vehicle_policies").insert({
        vehicle_id: vehicleRow.id,
        insurer_id: userId,
        policy_number: values.policyNumber.trim(),
        cover_type: values.coverType,
        inception_date: values.inceptionDate?.trim() || null,
        premium_amount: values.premiumAmount ? Number(values.premiumAmount) : null,
        insurer_reference: values.insurerReferenceNumber?.trim() || null,
      });

      if (policyError) {
        throw policyError;
      }

      toast({
        title: "Vehicle added",
        description: `${values.year} ${values.make.trim()} ${values.model.trim()} has been added successfully.`,
      });

      reset();
      setOpen(false);
      onVehicleAdded?.({
        id: vehicleRow.id,
        ownerId: "",
        make: values.make.trim(),
        model: values.model.trim(),
        year: values.year,
        vin,
        registrationNumber: values.registrationNumber.trim(),
        colour: values.colour?.trim(),
        mileage: values.mileage ?? 0,
        licenceDiscUrl: undefined,
        status: "insurer_added",
        imageUrl: "",
        serviceHistory: [],
        fuelHistory: [],
        insurance: {
          provider: "",
          policyNumber: values.policyNumber.trim(),
          coverage: values.coverType,
          expires: values.inceptionDate?.trim() || "",
        },
        approvedInsuranceIds: [userId],
        activityLog: [],
        consents: {
          allowDealerServiceAccess: false,
          allowResellerAccess: false,
          allowInsuranceAccess: true,
        },
      } as Vehicle);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Please check your details and try again.";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
          <DialogDescription>
            Add a vehicle and its policy details directly from the insurer portal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Section 1 - Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="vin">VIN</Label>
                  <Input id="vin" placeholder="1HGBH41JXMN109186" className="font-mono uppercase" {...register("vin")} />
                  {errors.vin && <p className="text-xs text-destructive">{errors.vin.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input id="registrationNumber" placeholder="ABC 123 GP" className="uppercase" {...register("registrationNumber")} />
                  {errors.registrationNumber && <p className="text-xs text-destructive">{errors.registrationNumber.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" placeholder="Toyota" {...register("make")} />
                  {errors.make && <p className="text-xs text-destructive">{errors.make.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="Corolla" {...register("model")} />
                  {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" placeholder={String(currentYear)} {...register("year", { valueAsNumber: true })} />
                  {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="colour">Colour</Label>
                  <Input id="colour" placeholder="White" {...register("colour")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mileage">Mileage</Label>
                <Input id="mileage" type="number" min={0} placeholder="0" {...register("mileage", { valueAsNumber: true })} />
                {errors.mileage && <p className="text-xs text-destructive">{errors.mileage.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Section 2 - Policy Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input id="policyNumber" placeholder="POL-12345" {...register("policyNumber")} />
                  {errors.policyNumber && <p className="text-xs text-destructive">{errors.policyNumber.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="coverType">Cover Type</Label>
                  <Select defaultValue="Comprehensive" onValueChange={(value) => setValue("coverType", value as FormValues["coverType"])}>
                    <SelectTrigger id="coverType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comprehensive">Comprehensive</SelectItem>
                      <SelectItem value="Third Party">Third Party</SelectItem>
                      <SelectItem value="Third Party Fire & Theft">Third Party Fire & Theft</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.coverType && <p className="text-xs text-destructive">{errors.coverType.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="inceptionDate">Inception Date</Label>
                  <Input id="inceptionDate" type="date" {...register("inceptionDate")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="premiumAmount">Premium Amount</Label>
                  <Input id="premiumAmount" type="number" min={0} placeholder="0.00" {...register("premiumAmount", { valueAsNumber: true })} />
                  {errors.premiumAmount && <p className="text-xs text-destructive">{errors.premiumAmount.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="insurerReferenceNumber">Insurer Reference Number</Label>
                <Input id="insurerReferenceNumber" placeholder="REF-001" {...register("insurerReferenceNumber")} />
              </div>
            </CardContent>
          </Card>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding…</>
              ) : (
                <><PlusCircle className="mr-2 h-4 w-4" />Add Vehicle</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
