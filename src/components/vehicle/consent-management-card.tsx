"use client";

import type { Vehicle, VehicleConsents, ActivityLogEntry } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConsentManagementCardProps {
    vehicle: Vehicle;
    onUpdate: (updatedData: Partial<Vehicle>) => void;
}

export function ConsentManagementCard({ vehicle, onUpdate }: ConsentManagementCardProps) {
    const { toast } = useToast();
    const auth = useAuth();
    
    const handleConsentChange = (consentKey: keyof VehicleConsents, value: boolean) => {
        const newConsents = { ...vehicle.consents, [consentKey]: value };

        const newActivityLogEntry: ActivityLogEntry = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: auth.userId || 'owner-1',
            action: 'Consent Updated',
            details: `Consent for '${consentKey}' was set to '${value}'.`,
            hash: Math.random().toString(36).substring(7),
            previousHash: vehicle.activityLog[0]?.hash || '000000'
        };

        const updatedActivityLog = [newActivityLogEntry, ...vehicle.activityLog];

        onUpdate({
            consents: newConsents,
            activityLog: updatedActivityLog
        });

        toast({
            title: "Preferences Saved",
            description: "Your data privacy choices have been updated and logged.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Sharing & Consent</CardTitle>
                        <CardDescription>Manage your data rights and third-party access.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert className="bg-muted/50 border-none">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs text-muted-foreground">
                        In compliance with POPIA, you have the right to control who accesses your vehicle's verified history. You can revoke access at any time.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                        <Label htmlFor="dealer-consent" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="font-semibold">Service Dealer Access</span>
                            <span className="font-normal leading-snug text-muted-foreground text-xs">
                               Allow workshops to view history and add verified records.
                            </span>
                        </Label>
                        <Switch
                            id="dealer-consent"
                            checked={vehicle.consents.allowDealerServiceAccess}
                            onCheckedChange={(value) => handleConsentChange('allowDealerServiceAccess', value)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                        <Label htmlFor="reseller-consent" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="font-semibold">Reseller Visibility</span>
                            <span className="font-normal leading-snug text-muted-foreground text-xs">
                                Enable approved resellers to see details only when 'For Sale'.
                            </span>
                        </Label>
                        <Switch
                            id="reseller-consent"
                            checked={vehicle.consents.allowResellerAccess}
                            onCheckedChange={(value) => handleConsentChange('allowResellerAccess', value)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                        <Label htmlFor="insurance-consent" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="font-semibold">Insurance Verification</span>
                            <span className="font-normal leading-snug text-muted-foreground text-xs">
                               Share data with providers specifically during active claims.
                            </span>
                        </Label>
                        <Switch
                            id="insurance-consent"
                            checked={vehicle.consents.allowInsuranceAccess}
                            onCheckedChange={(value) => handleConsentChange('allowInsuranceAccess', value)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
