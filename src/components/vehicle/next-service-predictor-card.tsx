"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarClock, Bot, TriangleAlert } from "lucide-react";
import { predictNextService } from "@/ai/flows/predict-next-service";
import { Skeleton } from "../ui/skeleton";
import { format, parseISO } from "date-fns";

export function NextServicePredictorCard({ vehicle }: { vehicle: Vehicle }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ service: string; date: string; reasoning: string } | null>(null);

  const getPrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const serviceHistory = vehicle.serviceHistory
        .map(s => `${s.date}: ${s.service}`)
        .join('\n');
      
      const result = await predictNextService({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        serviceHistory: serviceHistory || "No service history on record.",
      });

      if (result?.predictedService && result?.predictedDate) {
        setPrediction({
            service: result.predictedService,
            date: result.predictedDate,
            reasoning: result.reasoning
        });
      } else {
        throw new Error("AI did not return a valid prediction.");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred while generating the prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
            <CalendarClock className="h-6 w-6 text-primary" />
            <div>
                <CardTitle>Next Service Predictor</CardTitle>
                <CardDescription>AI-powered forecast for your next visit.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {prediction && (
            <Alert className="bg-accent/50 border-accent">
                <Bot className="h-4 w-4 text-accent-foreground" />
                <AlertTitle className="text-accent-foreground">
                    {prediction.service}
                </AlertTitle>
                <AlertDescription className="text-accent-foreground/90">
                    <p className="font-semibold text-lg">
                        Due around: {format(parseISO(prediction.date), "MMMM d, yyyy")}
                    </p>
                    <p className="mt-2 text-xs italic">{prediction.reasoning}</p>
                </AlertDescription>
            </Alert>
        )}
        {!loading && !error && !prediction && (
            <div className="text-center text-muted-foreground py-8">
                <p>Get an AI-based prediction for your vehicle's next routine service and its estimated due date.</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={getPrediction} disabled={loading} className="w-full">
          {loading ? "Calculating..." : "Predict Next Service"}
        </Button>
      </CardFooter>
    </Card>
  );
}
