"use client"

import type { Vehicle } from "@/lib/types";
import type { UserRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, UserCheck } from "lucide-react";
import Logo from "../logo";
import { Badge } from "../ui/badge";

interface VehicleReportProps {
    vehicle: Vehicle;
    userRole: UserRole | null;
}


export function VehicleReport({ vehicle, userRole }: VehicleReportProps) {
    
    const handlePrint = () => {
        window.print();
    }

    const PageToPrint = () => (
         <div className="space-y-6">
            <div className="text-center mb-8">
                <Logo className="justify-center mb-4"/>
                <h1 className="text-2xl font-bold">{vehicle.make} {vehicle.model} - {vehicle.year}</h1>
                <p className="text-lg text-muted-foreground font-mono">{vehicle.vin}</p>
                {vehicle.status === 'for_sale' && <Badge className="mt-2">For Sale</Badge>}
                <p className="text-sm mt-2">Generated on: {new Date().toLocaleDateString()}</p>
            </div>

            {userRole === 'owner' && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-center">Insurance Details</h3>
                    <div className="border rounded-lg p-4">
                        <dl className="grid grid-cols-2 gap-2">
                            <dt className="font-medium text-muted-foreground">Provider</dt>
                            <dd>{vehicle.insurance.provider}</dd>
                            <dt className="font-medium text-muted-foreground">Policy #</dt>
                            <dd>{vehicle.insurance.policyNumber}</dd>
                             <dt className="font-medium text-muted-foreground">Coverage</dt>
                            <dd>{vehicle.insurance.coverage}</dd>
                            <dt className="font-medium text-muted-foreground">Expires</dt>
                            <dd>{vehicle.insurance.expires}</dd>
                        </dl>
                    </div>
                </div>
            )}
            
            <div>
                <h3 className="text-xl font-semibold mb-2 text-center">Verified Service History</h3>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Service & Parts</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicle.serviceHistory.length > 0 ? (
                                vehicle.serviceHistory.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.date}</TableCell>
                                        <TableCell>
                                            <div className="font-semibold">{record.service}</div>
                                            {record.servicedBy && (
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                    <UserCheck className="h-3 w-3 text-green-600" /> 
                                                    <span>Verified: {record.servicedBy}</span>
                                                </div>
                                            )}
                                            {record.parts && record.parts.length > 0 && (
                                                <ul className="text-xs list-disc list-inside text-muted-foreground mt-1 pl-4">
                                                    {record.parts.map((part, idx) => <li key={idx}>{part.quantity}x {part.name}</li>)}
                                                </ul>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{record.notes}</TableCell>
                                        <TableCell className="text-right font-mono">${record.cost.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No service history records found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="text-center pt-4 text-xs text-muted-foreground">
                <p>This history is managed by CarSafe. For more details, visit our website.</p>
            </div>
        </div>
    );

    return (
        <>
            <style jsx global>{`
                @media print {
                    body {
                        background-color: white !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .printable-area {
                        display: block !important;
                    }
                    .non-printable {
                       display: none !important;
                    }
                    html, body, #__next {
                        height: initial !important;
                        overflow: initial !important;
                    }
                }
            `}</style>
            
            <div className="non-printable">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Printable Report</CardTitle>
                            <CardDescription>A summary of the vehicle for your records.</CardDescription>
                        </div>
                        <Button onClick={handlePrint} variant="outline">
                            <Printer className="mr-2 h-4 w-4"/>
                            Print Full Report
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="p-8 border rounded-lg bg-muted/20">
                           <PageToPrint />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="hidden printable-area">
                <PageToPrint />
            </div>
        </>
    );
}
