"use client";

import { useState, useRef } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { addVehicle } from "@/lib/data";
import type { Vehicle } from "@/lib/types";
import { PlusCircle, Upload, X, FileImage } from "lucide-react";

const currentYear = new Date().getFullYear();

const schema = z.object({
  make: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  year: z
    .number({ invalid_type_error: "Enter a valid year" })
    .int()
    .min(1900)
    .max(currentYear + 1),
  registrationNumber: z.string().min(1, "Required"),
  vin: z.string().min(1, "Required"),
  colour: z.string().min(1, "Required"),
  mileage: z
    .number({ invalid_type_error: "Enter a valid number" })
    .int()
    .min(0),
  status: z.enum(["active", "for_sale", "in_claim"]),
});

type FormValues = z.infer<typeof schema>;

interface AddVehicleDialogProps {
  ownerId: string;
  onVehicleAdded: (vehicle: Vehicle) => void;
  children?: React.ReactNode;
}

export function AddVehicleDialog({ ownerId, onVehicleAdded, children }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [licenceDiscFile, setLicenceDiscFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      status: "active",
      mileage: 0,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLicenceDiscFile(file);
  };

  const clearFile = () => {
    setLicenceDiscFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const vehicle = await addVehicle(ownerId, {
        ...values,
        licenceDiscFile: licenceDiscFile ?? undefined,
      });
      onVehicleAdded(vehicle);
      toast({
        title: "Vehicle added",
        description: `${values.year} ${values.make} ${values.model} has been added to your fleet.`,
      });
      reset();
      clearFile();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Failed to add vehicle",
        description: "Please check your details and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      clearFile();
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
          <DialogDescription>
            Enter your vehicle's basic details. Service history is added separately by verified dealers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder={String(currentYear)}
                {...register("year", { valueAsNumber: true })}
              />
              {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="colour">Colour</Label>
              <Input id="colour" placeholder="White" {...register("colour")} />
              {errors.colour && <p className="text-xs text-destructive">{errors.colour.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              placeholder="ABC 123 GP"
              {...register("registrationNumber")}
            />
            {errors.registrationNumber && (
              <p className="text-xs text-destructive">{errors.registrationNumber.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vin">VIN</Label>
            <Input
              id="vin"
              placeholder="1HGBH41JXMN109186"
              className="font-mono"
              {...register("vin")}
            />
            {errors.vin && <p className="text-xs text-destructive">{errors.vin.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="mileage">Mileage (km)</Label>
              <Input
                id="mileage"
                type="number"
                placeholder="0"
                min={0}
                {...register("mileage", { valueAsNumber: true })}
              />
              {errors.mileage && <p className="text-xs text-destructive">{errors.mileage.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue="active"
                onValueChange={(v) => setValue("status", v as FormValues["status"])}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="for_sale">For Sale</SelectItem>
                  <SelectItem value="in_claim">In Claim</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Licence Disc Photo (optional)</Label>
            {licenceDiscFile ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                <FileImage className="h-5 w-5 flex-shrink-0 text-primary" />
                <span className="flex-1 truncate text-sm">{licenceDiscFile.name}</span>
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground hover:border-primary/50 hover:bg-muted/40 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Click to upload a photo
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
