
"use client";

import { useState, useEffect } from "react";
import type { Vehicle } from "@/lib/types";
import { predictNextService, type PredictNextServiceOutput } from "@/ai/flows/predict-next-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, Phone, Flag } from "lucide-react";
import { format, parseISO, differenceInDays } from 'date-fns';
import Link from "next/link";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";


interface Prediction extends PredictNextServiceOutput {
    vehicleId: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
}

const UpcomingServiceRowSkeleton = () => (
    <TableRow>
        <TableCell>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24 mt-1" />
        </TableCell>
        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
    </TableRow>
);


export function UpcomingServices({ vehicles }: { vehicles: Vehicle[] }) {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPredictions = async () => {
            setIsLoading(true);
            
            // OPTIMIZATION: Reduce the number of vehicles we predict for on page load.
            // Calling 10 AI prompts in parallel is too slow. We limit to 3 for better UX.
            const vehiclesToPredict = vehicles.slice(0, 3);

            const predictionPromises = vehiclesToPredict.map(vehicle => {
                const serviceHistory = vehicle.serviceHistory
                    .map(s => `${s.date}: ${s.service}`)
                    .join('\n');
                
                return predictNextService({
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    serviceHistory: serviceHistory || "No service history on record.",
                }).then(prediction => ({ 
                    ...prediction, 
                    vehicleId: vehicle.id, 
                    vehicleMake: vehicle.make, 
                    vehicleModel: vehicle.model,
                    vehicleYear: vehicle.year,
                })).catch(err => {
                    console.error(`Failed to get prediction for vehicle ${vehicle.id}`, err);
                    return null;
                });
            });

            const results = await Promise.all(predictionPromises);
            const successfulPredictions = results.filter((p): p is Prediction => p !== null && !!p.predictedDate);
            
            successfulPredictions.sort((a, b) => new Date(a.predictedDate).getTime() - new Date(b.predictedDate).getTime());

            setPredictions(successfulPredictions);
            setIsLoading(false);
        };

        if (vehicles.length > 0) {
            fetchPredictions();
        } else {
            setIsLoading(false);
        }
    }, [vehicles]);
    
    const getFlag = (date: string) => {
        try {
            const daysUntilDue = differenceInDays(parseISO(date), new Date());
            if (daysUntilDue < 0) {
                return {
                    icon: <Flag className="h-5 w-5 text-red-500" />,
                    tooltip: "Service is overdue",
                    colorClass: "bg-red-100 dark:bg-red-900/30",
                };
            }
            if (daysUntilDue <= 30) {
                return {
                    icon: <Flag className="h-5 w-5 text-destructive" />,
                    tooltip: `Due in ${daysUntilDue} days`,
                    colorClass: "bg-destructive/10",
                };
            }
            if (daysUntilDue <= 60) {
                return {
                    icon: <Flag className="h-5 w-5 text-amber-500" />,
                    tooltip: `Due in ${daysUntilDue} days`,
                    colorClass: "bg-amber-500/10",
                };
            }
        } catch (e) {
            return null;
        }

        return null;
    }

    return (
        <Card className="mb-8">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <CalendarCheck className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Upcoming Service Radar</CardTitle>
                        <CardDescription>AI-predicted services for top priority vehicles.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Predicted Service</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                           <>
                            <UpcomingServiceRowSkeleton />
                            <UpcomingServiceRowSkeleton />
                           </>
                        ) : predictions.length > 0 ? (
                            predictions.map(prediction => {
                                const flag = getFlag(prediction.predictedDate);
                                return (
                                <TooltipProvider key={prediction.vehicleId}>
                                <TableRow className={flag?.colorClass}>
                                    <TableCell>
                                        <Link href={`/dashboard/vehicles/${prediction.vehicleId}`} className="font-medium hover:underline">{prediction.vehicleMake} {prediction.vehicleModel}</Link>
                                        <div className="text-sm text-muted-foreground">{prediction.vehicleYear}</div>
                                    </TableCell>
                                    <TableCell>{prediction.predictedService}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span>{format(parseISO(prediction.predictedDate), "MMM d, yyyy")}</span>
                                            {flag && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        {flag.icon}
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{flag.tooltip}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline">
                                            <Phone className="mr-2 h-4 w-4" />
                                            Contact
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                </TooltipProvider>
                            )})
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No upcoming service predictions available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
    );
}
