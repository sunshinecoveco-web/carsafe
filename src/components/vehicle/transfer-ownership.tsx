"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export function TransferOwnershipCard({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const { toast } = useToast();
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTransfer = () => {
    if (!newOwnerEmail || !newOwnerEmail.includes('@')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address for the new owner.",
      });
      return;
    }

    // Simulate backend transfer by storing the transferred ID in localStorage
    const transferredIds = JSON.parse(localStorage.getItem('carsafe_transferred_ids') || '[]');
    if (!transferredIds.includes(vehicle.id)) {
      transferredIds.push(vehicle.id);
      localStorage.setItem('carsafe_transferred_ids', JSON.stringify(transferredIds));
    }

    toast({
      title: "Transfer Initiated",
      description: `Ownership of ${vehicle.make} ${vehicle.model} has been transferred to ${newOwnerEmail}.`,
    });

    setIsDialogOpen(false);
    router.push("/dashboard");
    router.refresh(); // To ensure dashboard refetches
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Send className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Transfer Ownership</CardTitle>
            <CardDescription>
              Transfer this vehicle and its entire history to a new owner.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button className="w-full">Initiate Transfer</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Vehicle Transfer</AlertDialogTitle>
              <AlertDialogDescription>
                This action is permanent. You will lose access to this vehicle and its records. Please enter the new owner's email address to proceed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="email" className="text-right">
                New Owner's Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="new.owner@example.com"
                value={newOwnerEmail}
                onChange={(e) => setNewOwnerEmail(e.target.value)}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleTransfer} disabled={!newOwnerEmail}>
                Confirm and Transfer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
