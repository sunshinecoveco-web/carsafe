"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FilePenLine, Bot, TriangleAlert, Copy } from "lucide-react";
import { generateSalesDescription } from "@/ai/flows/generate-sales-description-flow";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function AiSalesCopyCard({ vehicle }: { vehicle: Vehicle }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const getSalesCopy = async () => {
    setLoading(true);
    setError(null);
    setDescription(null);

    try {
      const serviceHighlights = vehicle.serviceHistory
        .slice(0, 5) // Use the 5 most recent services as highlights
        .map(s => `- ${s.service} performed on ${s.date}`)
        .join('\n');
      
      const result = await generateSalesDescription({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
        serviceHighlights: serviceHighlights || "No recent service history available.",
      });

      if (result?.salesDescription) {
        setDescription(result.salesDescription);
      } else {
        throw new Error("AI did not return a valid description.");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred while generating the sales copy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (description) {
      navigator.clipboard.writeText(description);
      toast({ title: "Copied to clipboard!" });
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
            <FilePenLine className="h-6 w-6 text-primary" />
            <div>
                <CardTitle>AI Sales Copy Generator</CardTitle>
                <CardDescription>Create a compelling sales pitch instantly.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {description && (
             <div className="relative">
                <Textarea 
                    readOnly 
                    value={description} 
                    className="h-48 bg-muted" 
                />
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2"
                    onClick={handleCopy}
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        )}
        {!loading && !error && !description && (
            <div className="text-center text-muted-foreground py-8">
                <p>Generate a professional sales description for online listings based on this vehicle's verified history.</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={getSalesCopy} disabled={loading} className="w-full">
          {loading ? "Writing..." : description ? "Regenerate Copy" : "Generate Sales Copy"}
        </Button>
      </CardFooter>
    </Card>
  );
}
