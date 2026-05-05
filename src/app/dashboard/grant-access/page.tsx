
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { getVehicleById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function GrantAccess() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const auth = useAuth();
    const vehicleId = searchParams.get('vehicleId');

    const [accessCode, setAccessCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStep, setVerificationStep] = useState<'initial_checks' | 'awaiting_code' | 'verified'>('initial_checks');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!auth.isAuthenticated) return; // Wait for auth to be loaded

        const initialChecks = async () => {
            if (auth.role !== 'dealer') {
                setError('Only users with the Dealer role can be granted service access.');
                return;
            }
            if (!vehicleId) {
                setError('The access link is missing vehicle information.');
                return;
            }

            const vehicle = await getVehicleById(vehicleId);
            if (!vehicle) {
                 setError('The vehicle associated with this link could not be found.');
                return;
            }
            if (!vehicle.consents.allowDealerServiceAccess) {
                 setError('The vehicle owner has not consented to share service data with dealers.');
                return;
            }
            // All initial checks passed, move to code verification step
            setVerificationStep('awaiting_code');
        };

        initialChecks();

    }, [auth, vehicleId, router, toast]);

    const handleVerifyCode = async () => {
        setIsVerifying(true);
        setError(null);

        if (!vehicleId || !accessCode) {
            toast({ variant: 'destructive', title: 'Missing Information' });
            setIsVerifying(false);
            return;
        }

        // Retrieve stored code from localStorage
        const storedData = localStorage.getItem(`carsafe_ac_${vehicleId}`);
        if (!storedData) {
            toast({ variant: 'destructive', title: 'Verification Failed', description: 'Access code has expired or is invalid. Please ask the owner to generate a new one.' });
            setIsVerifying(false);
            return;
        }

        const { code, expiry } = JSON.parse(storedData);

        if (Date.now() > expiry) {
            toast({ variant: 'destructive', title: 'Code Expired', description: 'This access code has expired. Please ask the owner for a new one.' });
            localStorage.removeItem(`carsafe_ac_${vehicleId}`);
            setIsVerifying(false);
            return;
        }

        if (code !== accessCode) {
            toast({ variant: 'destructive', title: 'Invalid Code', description: 'The access code is incorrect. Please try again.' });
            setIsVerifying(false);
            return;
        }

        // --- SUCCESS ---
        // In a real app, you would make an API call here to:
        // 1. Add the current dealer's ID (auth.userId) to the vehicle's `approvedDealerIds` array in the database.
        // 2. The data.ts file is a mock, so we can't update it directly. We'll just simulate success.
        
        // Clean up the used code
        localStorage.removeItem(`carsafe_ac_${vehicleId}`);

        setVerificationStep('verified');
        toast({
            title: 'Access Granted!',
            description: `You can now view and manage the service history for vehicle ${vehicleId}.`,
        });

        // Redirect the dealer to the vehicle's detail page
        router.replace(`/dashboard/vehicles/${vehicleId}`);
        setIsVerifying(false);
    };

    if (error) {
        return (
             <div className="flex min-h-screen items-center justify-center bg-background">
                <Card className="w-full max-w-md border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-3 text-2xl text-destructive">
                            <ShieldAlert className="h-6 w-6" />
                            Access Denied
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-destructive">{error}</p>
                         <Button onClick={() => router.replace('/dashboard')}>Return to Dashboard</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (verificationStep === 'initial_checks') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Verifying Request...
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center text-muted-foreground">
                        <p>Please wait while we securely check your permissions.</p>
                        <Skeleton className="h-4 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                    </CardContent>
                </Card>
            </div>
        );
    }


    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        One-Time Access Code
                    </CardTitle>
                    <CardContent className="text-center text-muted-foreground pt-4">
                        Ask the vehicle owner for the 6-digit code displayed on their screen to complete the verification.
                    </CardContent>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="access-code">6-Digit Access Code</Label>
                        <Input
                            id="access-code"
                            type="text"
                            maxLength={6}
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, ''))}
                            className="text-center text-2xl font-mono tracking-[0.5em]"
                            placeholder="· · · · · ·"
                            disabled={isVerifying}
                        />
                     </div>
                     <Button className="w-full" onClick={handleVerifyCode} disabled={isVerifying || accessCode.length !== 6}>
                        {isVerifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Verifying...</> : 'Grant Access'}
                     </Button>
                </CardContent>
            </Card>
        </div>
    );
}

// Wrap the component in Suspense because useSearchParams() requires it.
export default function GrantAccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GrantAccess />
        </Suspense>
    )
}
