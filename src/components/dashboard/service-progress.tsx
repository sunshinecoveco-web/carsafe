"use client";

import type { Vehicle, ServiceRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Rocket, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";

type InProgressService = ServiceRecord & {
    vehicleMake: string;
    vehicleModel: string;
    vehicleId: string;
};

const statusMap = {
    'Scheduled': { icon: <Clock className="h-4 w-4 text-muted-foreground" />, color: "bg-gray-500/10 dark:bg-gray-500/20" },
    'In Progress': { icon: <Rocket className="h-4 w-4 text-blue-500" />, color: "bg-blue-500/10 dark:bg-blue-500/20" },
    'Awaiting Approval': { icon: <AlertCircle className="h-4 w-4 text-amber-500" />, color: "bg-amber-500/10 dark:bg-amber-500/20" },
    'Ready for Pickup': { icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, color: "bg-green-500/10 dark:bg-green-500/20" },
    'Completed': { icon: null, color: "" },
};

export function ServiceProgress({ vehicles }: { vehicles: Vehicle[] }) {
    const inProgressServices: InProgressService[] = vehicles
        .flatMap(v => 
            v.serviceHistory
                .filter(s => s.status !== 'Completed')
                .map(s => ({
                    ...s,
                    vehicleMake: v.make,
                    vehicleModel: v.model,
                    vehicleId: v.id,
                }))
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (inProgressServices.length === 0) {
        return null; // Don't render the card if there's nothing in progress
    }

    return (
        <Card className="mb-8">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Rocket className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Active Service Progress</CardTitle>
                        <CardDescription>Updates on your vehicles currently being serviced.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Serviced By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inProgressServices.map(service => {
                             const statusInfo = statusMap[service.status];
                             return (
                                <TableRow key={service.id} className={statusInfo?.color}>
                                    <TableCell>
                                        <Link href={`/dashboard/vehicles/${service.vehicleId}`} className="font-medium hover:underline">{service.vehicleMake} {service.vehicleModel}</Link>
                                    </TableCell>
                                    <TableCell>{service.service}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="flex items-center gap-2">
                                            {statusInfo?.icon}
                                            {service.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{service.servicedBy || 'N/A'}</TableCell>
                                </TableRow>
                             )
                        })}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
    );
}

    
