"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabase";
import type { Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";

interface InsurerLinkRequestModalProps {
  vehicle: Vehicle;
  userId: string | null;
  canRequest?: boolean;
}

export function InsurerLinkRequestModal({ vehicle, userId, canRequest = false }: InsurerLinkRequestModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canRequest || !userId) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Please enter an owner email address.");
      return;
    }

    setSubmitting(true);
    setError(null);

    let ownerId: string | null = null;
    try {
      const response = await fetch(`/api/owners/lookup?email=${encodeURIComponent(trimmedEmail)}`, {
        method: "GET",
        cache: "no-store",
      });
      const lookupResult = await response.json();

      if (!response.ok) {
        throw new Error(lookupResult.error || "Unable to look up owner account.");
      }

      ownerId = lookupResult.userId ?? null;
    } catch (lookupError) {
      setSubmitting(false);
      setError(lookupError instanceof Error ? lookupError.message : "Unable to look up owner account.");
      return;
    }

    if (!ownerId) {
      setSubmitting(false);
      setError("No owner account found with that email");
      return;
    }

    const { error: insertError } = await supabase.from("vehicle_link_requests").insert({
      vehicle_id: vehicle.id,
      insurer_id: userId,
      owner_id: ownerId,
      status: "pending",
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    toast({ title: "Link request sent", description: "The vehicle owner has been notified." });
    setOpen(false);
    setEmail("");
  };

  if (!canRequest) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Send className="mr-2 h-4 w-4" />
          Link to Owner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link to Owner</DialogTitle>
          <DialogDescription>Send a link request to the owner account for this vehicle.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ownerEmail">Owner Email Address</Label>
            <Input
              id="ownerEmail"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
              placeholder="owner@example.com"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : <><Send className="mr-2 h-4 w-4" />Send Request</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
