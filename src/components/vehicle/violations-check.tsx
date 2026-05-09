"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Siren, ShieldCheck, ShieldAlert, Loader2, Info } from "lucide-react";
import { checkViolations, type ViolationsCheckOutput } from "@/ai/flows/violations-check-flow";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import type { Vehicle } from "@/lib/types";

export function ViolationsCheckCard({ vehicle }: { vehicle: Vehicle }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ViolationsCheckOutput | null>(null);

    const handleCheck = async () => {
        setLoading(true);
        try {
            const output = await checkViolations({
                vin: vehicle.vin,
                make: vehicle.make,
                model: vehicle.model
            });
            setResult(output);
            toast({ title: "Compliance Check Complete" });
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: "Check Failed", description: "Could not connect to the violations database." });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Valid': return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">Valid</Badge>;
            case 'Expired': return <Badge variant="destructive">Expired</Badge>;
            case 'Suspended': return <Badge variant="destructive">Suspended</Badge>;
            case 'Flagged': return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Flagged</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Siren className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Traffic Fines & Violations</CardTitle>
                        <CardDescription>Live check against simulated national database.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Querying e-NaTIS records...</p>
                    </div>
                ) : result ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="text-sm font-medium">Registration Status</span>
                            {getStatusBadge(result.registrationStatus)}
                        </div>
                        {result.hasOutstandingFines ? (
                            <Alert variant="destructive">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertTitle>Fines Detected</AlertTitle>
                                <AlertDescription>{result.finesSummary}</AlertDescription>
                            </Alert>
                        ) : (
                            <Alert className="bg-green-500/5 border-green-500/20 text-green-700 dark:text-green-400">
                                <ShieldCheck className="h-4 w-4" />
                                <AlertTitle>Clear Record</AlertTitle>
                                <AlertDescription>No outstanding fines found for this VIN.</AlertDescription>
                            </Alert>
                        )}
                        {result.legalNotes && (
                            <div className="p-3 bg-muted rounded-lg text-xs flex gap-2">
                                <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span>{result.legalNotes}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground">Perform a compliance check to view legal and registration status.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-4">
                <Button className="w-full" onClick={handleCheck} disabled={loading}>
                    {result ? "Refresh Status" : "Perform Legal Check"}
                </Button>
            </CardFooter>
        </Card>
    );
}
