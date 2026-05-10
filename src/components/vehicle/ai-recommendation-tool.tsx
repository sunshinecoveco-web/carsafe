"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Bot, TriangleAlert } from "lucide-react";
import { serviceRecommendation } from "@/ai/flows/service-recommendation";
import { Skeleton } from "../ui/skeleton";

export function AiRecommendationTool({ vehicle }: { vehicle: Vehicle }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const historicalServices = vehicle.serviceHistory
        .map(s => {
          const partsList = s.parts && s.parts.length > 0 ? ` Parts used: ${s.parts.map(p => `${p.quantity}x ${p.name}`).join(', ')}.` : '';
          return `${s.date}: ${s.service} - ${s.notes}.${partsList}`;
        })
        .join('\n');
      
      const result = await serviceRecommendation({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        historicalServices: historicalServices || "No service history on record.",
      });

      if (result?.recommendations) {
        setRecommendations(result.recommendations);
      } else {
        throw new Error("AI did not return any recommendations.");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred while getting recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
                <CardTitle>AI Service Recommendations</CardTitle>
                <CardDescription>Get intelligent maintenance suggestions.</CardDescription>
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
        {recommendations && (
            <Alert className="bg-accent/50 border-accent">
                <Bot className="h-4 w-4 text-accent-foreground" />
                <AlertTitle className="text-accent-foreground">Expert Suggestions</AlertTitle>
                <AlertDescription className="text-accent-foreground/90 whitespace-pre-line">
                    {recommendations}
                </AlertDescription>
            </Alert>
        )}
        {!loading && !error && !recommendations && (
            <div className="text-center text-muted-foreground py-8">
                <p>Click the button below to ask our AI expert for personalized service recommendations for your {vehicle.make} {vehicle.model}.</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={getRecommendations} disabled={loading} className="w-full">
          {loading ? "Analyzing..." : "Generate Recommendations"}
        </Button>
      </CardFooter>
    </Card>
  );
}
