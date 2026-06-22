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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addDealerServiceRecord } from "@/lib/dealer";
import type { DealerProfile, DealerVehicle } from "@/lib/dealer";
import {
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  Wrench,
} from "lucide-react";

const schema = z.object({
  serviceDate: z.string().min(1, "Required"),
  category: z.enum(
    ["Routine Maintenance", "Repairs", "Tires", "Inspection", "Other"],
    { required_error: "Select a service type" },
  ),
  description: z.string().min(2, "Describe the service or repair"),
  mileageAtService: z
    .number({ invalid_type_error: "Enter a valid mileage" })
    .int()
    .min(0),
  technicianName: z.string().min(1, "Required"),
  labourCost: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .min(0),
  totalCost: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .min(0),
  notes: z.string().default(""),
});

type FormValues = z.infer<typeof schema>;

interface Part {
  name: string;
  quantity: number;
}

interface AddServiceRecordDialogProps {
  profile: DealerProfile;
  vehicle: DealerVehicle;
  onRecordAdded: () => void;
  children?: React.ReactNode;
}

export function AddServiceRecordDialog({
  profile,
  vehicle,
  onRecordAdded,
  children,
}: AddServiceRecordDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceDate: today,
      category: undefined,
      description: "",
      mileageAtService: vehicle.mileage ?? 0,
      technicianName: "",
      labourCost: 0,
      totalCost: 0,
      notes: "",
    },
  });

  const addPart = () =>
    setParts(prev => [...prev, { name: "", quantity: 1 }]);

  const removePart = (i: number) =>
    setParts(prev => prev.filter((_, idx) => idx !== i));

  const updatePart = (i: number, field: keyof Part, value: string | number) =>
    setParts(prev =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)),
    );

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const validParts = parts.filter(p => p.name.trim());

    const { error } = await addDealerServiceRecord(profile, {
      vehicleId: vehicle.id,
      serviceDate: values.serviceDate,
      category: values.category,
      description: values.description,
      mileageAtService: values.mileageAtService,
      technicianName: values.technicianName,
      labourCost: values.labourCost,
      totalCost: values.totalCost,
      parts: validParts,
      notes: values.notes,
    });

    if (error) {
      setServerError(error);
      return;
    }

    toast({
      title: "Record added",
      description: `${values.category} on ${values.serviceDate} saved for ${vehicle.year} ${vehicle.make} ${vehicle.model}.`,
    });

    onRecordAdded();
    handleOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset({
        serviceDate: today,
        category: undefined,
        description: "",
        mileageAtService: vehicle.mileage ?? 0,
        technicianName: "",
        labourCost: 0,
        totalCost: 0,
        notes: "",
      });
      setParts([]);
      setServerError(null);
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            <Wrench className="mr-1.5 h-3.5 w-3.5" />
            Add Record
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Service / Repair Record</DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <span>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </span>
            {vehicle.registrationNumber && (
              <Badge variant="outline" className="font-mono text-xs">
                {vehicle.registrationNumber}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Dealer stamp */}
        <div className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-800">
          <ShieldCheck className="h-4 w-4 flex-shrink-0" />
          <span>
            Submitted by <span className="font-semibold">{profile.dealershipName}</span>
            {profile.isVerified && (
              <Badge className="ml-2 bg-blue-600 text-white text-[10px] px-1.5 py-0">
                Verified
              </Badge>
            )}
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="serviceDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Routine Maintenance">Routine Maintenance</SelectItem>
                      <SelectItem value="Repairs">Repairs</SelectItem>
                      <SelectItem value="Tires">Tires</SelectItem>
                      <SelectItem value="Inspection">Inspection</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 60,000km service / Front brake pads replaced" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="mileageAtService" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mileage at Service (km)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="technicianName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Technician</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />

            {/* Parts list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Parts Replaced</p>
                <Button type="button" variant="ghost" size="sm" onClick={addPart}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Part
                </Button>
              </div>
              {parts.length === 0 && (
                <p className="text-xs text-muted-foreground">No parts added.</p>
              )}
              {parts.map((part, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Part name"
                    value={part.name}
                    onChange={e => updatePart(i, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={part.quantity}
                    onChange={e => updatePart(i, "quantity", parseInt(e.target.value, 10) || 1)}
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removePart(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="labourCost" render={({ field }) => (
                <FormItem>
                  <FormLabel>Labour Cost (R)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="totalCost" render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Cost (R)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional observations or recommendations…"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                ) : (
                  "Save Record"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
