"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDemoVehicles } from "@/lib/data";
import type { Vehicle } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { VehicleList } from "@/components/dashboard/vehicle-list";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

const DemoSkeleton = () => (
  <div className="container mx-auto p-4 sm:p-6 md:p-8">
    <div className="grid gap-8">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-96 w-full" />
    </div>
  </div>
);

export default function DemoPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const auth = useAuth();
  const demoEnabled = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!demoEnabled) {
      setLoading(false);
      return;
    }

    async function loadDemoVehicles() {
      try {
        const data = await getDemoVehicles();
        setVehicles(data);
      } catch (error) {
        console.error("Failed to load demo vehicles:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDemoVehicles();
  }, [demoEnabled]);

  if (!demoEnabled) {
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Demo Mode Disabled</CardTitle>
            <CardDescription>
              The demo page is only available when <code>NEXT_PUBLIC_DEMO_MODE=true</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Enable the environment flag and redeploy or restart the app to access the demo hero experience.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hydrated || loading) {
    return <DemoSkeleton />;
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to view the demo</CardTitle>
            <CardDescription>
              This demo page is only available to authenticated users when demo mode is enabled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please sign in to continue.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Go to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <p className="text-sm">Temporary recruiting/demo route</p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Demo Hero Vehicles</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          This page showcases the five highlighted demo vehicles. Click any card to open the vehicle dashboard.
        </p>
      </header>

      {vehicles.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Demo Vehicles Available</CardTitle>
            <CardDescription>
              No vehicles are currently marked as demo heroes. Check your database seed or demo flag settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add <code>is_demo_hero = true</code> for vehicles in the seed data to appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <VehicleList vehicles={vehicles} />
      )}
    </div>
  );
}
