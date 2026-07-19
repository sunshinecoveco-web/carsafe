"use client";

import { useState } from "react";
import { supabase } from "@/supabase";
import { useToast } from "@/hooks/use-toast";
import type { ServiceRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Wrench, UserCheck } from "lucide-react";

interface WorkshopServiceHistoryCardProps {
  serviceHistory: ServiceRecord[];
  onUpdateHistory: (newHistory: ServiceRecord[]) => void;
  vehicleId: string;
  userId: string | null;
}

const serviceTypes = ["Service", "Repair", "Inspection", "Tyres", "Electrical", "Other"] as const;

export function WorkshopServiceHistoryCard({ serviceHistory, onUpdateHistory, vehicleId, userId }: WorkshopServiceHistoryCardProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [serviceType, setServiceType] = useState<(typeof serviceTypes)[number]>("Service");
  const [description, setDescription] = useState("");
  const [mileageAtService, setMileageAtService] = useState("");
  const [partsReplaced, setPartsReplaced] = useState("");
  const [technicianName, setTechnicianName] = useState("");

  const canManageRecord = (record: ServiceRecord) =>
    record.createdByRole === "workshop" && record.createdByUserId === userId;

  const resetForm = () => {
    setServiceDate(new Date().toISOString().split("T")[0]);
    setServiceType("Service");
    setDescription("");
    setMileageAtService("");
    setPartsReplaced("");
    setTechnicianName("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) return;

    const trimmedDescription = description.trim();
    const trimmedTechnician = technicianName.trim();
    if (!trimmedDescription || !trimmedTechnician) {
      toast({ variant: "destructive", title: "Missing details", description: "Add a description and technician name before saving." });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("service_logs")
        .insert({
          vehicle_id: vehicleId,
          service_date: serviceDate,
          category: serviceType,
          description: trimmedDescription,
          mileage_at_service: mileageAtService ? Number(mileageAtService) : null,
          workshop: trimmedTechnician,
          cost: 0,
          notes: partsReplaced.trim() ? `Parts replaced: ${partsReplaced.trim()}` : "",
          status: "Completed",
          created_by_role: "workshop",
          created_by_user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      const newRecord: ServiceRecord = {
        id: data.id,
        date: data.service_date,
        service: data.description,
        cost: Number(data.cost ?? 0),
        notes: data.notes ?? "",
        status: (data.status as ServiceRecord["status"]) ?? "Completed",
        category: (data.category as ServiceRecord["category"]) ?? undefined,
        servicedBy: data.workshop ?? undefined,
        mileageAtService: data.mileage_at_service ?? undefined,
        technicianName: data.workshop ?? undefined,
        createdByRole: data.created_by_role ?? undefined,
        createdByUserId: data.created_by_user_id ?? undefined,
      };

      onUpdateHistory([newRecord, ...serviceHistory]);
      toast({ title: "Service record added", description: "The workshop entry has been saved to the vehicle record." });
      resetForm();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Unable to save record", description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: ServiceRecord) => {
    if (!canManageRecord(record)) return;

    try {
      const { error } = await supabase.from("service_logs").delete().eq("id", record.id);
      if (error) throw error;
      onUpdateHistory(serviceHistory.filter((item) => item.id !== record.id));
      toast({ title: "Record removed", description: "Your workshop entry was removed from the vehicle history." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Unable to remove record", description: err instanceof Error ? err.message : "Please try again." });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Workshop Service History</CardTitle>
            <CardDescription>Record repairs and service work completed for this vehicle.</CardDescription>
          </div>
        </div>
        <Dialog open={open} onOpenChange={(next) => { if (!next) resetForm(); setOpen(next); }}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Service / Repair Record</DialogTitle>
              <DialogDescription>Save the work completed by your workshop team.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Date</label>
                  <Input type="date" value={serviceDate} onChange={(event) => setServiceDate(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Type</label>
                  <Select value={serviceType} onValueChange={(value) => setServiceType(value as (typeof serviceTypes)[number])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="e.g. Brake pads replaced" value={description} onChange={(event) => setDescription(event.target.value)} required />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mileage at Service</label>
                  <Input type="number" min={0} placeholder="0" value={mileageAtService} onChange={(event) => setMileageAtService(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Technician Name</label>
                  <Input placeholder="John Smith" value={technicianName} onChange={(event) => setTechnicianName(event.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Parts Replaced (optional)</label>
                <Textarea placeholder="e.g. Front brake pads, spark plugs" value={partsReplaced} onChange={(event) => setPartsReplaced(event.target.value)} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : "Save Record"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {serviceHistory.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No workshop service history yet for this vehicle.
          </div>
        ) : (
          <div className="space-y-3">
            {serviceHistory.map((record) => (
              <div key={record.id} className="rounded-lg border bg-background/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{record.service}</p>
                      {record.category && <Badge variant="outline">{record.category}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                      <span>{record.date}</span>
                      {record.mileageAtService != null && <span>· {record.mileageAtService.toLocaleString()} km</span>}
                      {record.servicedBy && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5" />
                          {record.servicedBy}
                        </span>
                      )}
                    </div>
                    {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {canManageRecord(record) && (
                      <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(record)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
