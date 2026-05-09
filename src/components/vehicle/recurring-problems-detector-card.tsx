"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, TriangleAlert, Microscope, CheckCircle2 } from "lucide-react";
import { detectRecurringProblems, type DetectRecurringProblemsOutput } from "@/ai/flows/recurring-problems-flow";
import { Skeleton } from "../ui/skeleton";

export function RecurringProblemsDetectorCard({ vehicle }: { vehicle: Vehicle }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectRecurringProblemsOutput | null>(null);

  const getAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const serviceHistory = vehicle.serviceHistory
        .map(s => `${s.date}: ${s.service} - Notes: ${s.notes || 'N/A'}`)
        .join('\n');
      
      const analysisResult = await detectRecurringProblems({
        serviceHistory: serviceHistory || "No service history on record.",
      });

      if (analysisResult) {
        setResult(analysisResult);
      } else {
        throw new Error("AI did not return a valid analysis.");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred while analyzing the service history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.hasRecurringProblem) {
        return (
             <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>
                    Recurring Problem Detected: {result.recurringProblem}
                </AlertTitle>
                <AlertDescription className="mt-2">
                    <p className="text-sm">{result.analysis}</p>
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>No Recurring Problems Found</AlertTitle>
            <AlertDescription>
                Our AI analysis did not detect any significant recurring issues in the service history.
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Microscope className="h-6 w-6 text-primary" />
            <div>
                <CardTitle>Recurring Problem Detector</CardTitle>
                <CardDescription>AI-powered diagnostic analysis.</CardDescription>
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
        {result && renderResult()}

        {!loading && !error && !result && (
            <div className="text-center text-muted-foreground py-8">
                <p>Let our AI analyze the service history for patterns of chronic issues or repeated repairs.</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={getAnalysis} disabled={loading} className="w-full">
          {loading ? "Analyzing..." : "Analyze for Recurring Problems"}
        </Button>
      </CardFooter>
    </Card>
  );
}
