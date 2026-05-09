
"use client";

import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QrCode, ShieldCheck, Printer, ShieldAlert, Timer } from "lucide-react";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function ShareWithDealerCard({ vehicleId, disabled }: { vehicleId: string, disabled: boolean }) {
    const { toast } = useToast();
    const [accessUrl, setAccessUrl] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [accessCode, setAccessCode] = useState<string | null>(null);
    const [timer, setTimer] = useState(0);

    const generateAccessCode = useCallback(() => {
        if (disabled) return;
        
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setAccessCode(code);
        setTimer(300); // 5 minutes

        // Store code and expiry in localStorage to be checked on the grant-access page
        const expiry = Date.now() + 300 * 1000;
        localStorage.setItem(`carsafe_ac_${vehicleId}`, JSON.stringify({ code, expiry }));

    }, [vehicleId, disabled]);
    
    useEffect(() => {
        if (disabled) {
            setAccessCode(null);
            setTimer(0);
            return;
        };

        const url = `${window.location.origin}/dashboard/grant-access?vehicleId=${vehicleId}`;
        setAccessUrl(url);

        QRCode.toDataURL(url, {
            width: 512,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })
        .then(qrUrl => {
            setQrCodeUrl(qrUrl);
        })
        .catch(err => {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Could not generate QR code.",
            });
        });

    }, [vehicleId, toast, disabled]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (timer === 0 && accessCode) {
            setAccessCode(null);
            localStorage.removeItem(`carsafe_ac_${vehicleId}`);
        }
    }, [timer, accessCode, vehicleId]);
    
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(`
            <html>
                <head>
                    <title>Grant Dealer Access</title>
                    <style>
                        @media print {
                            @page { size: A4; margin: 20mm; }
                            body { font-family: sans-serif; text-align: center; }
                            h2 { font-size: 24px; }
                            img { max-width: 60%; height: auto; border: 1px solid #eee; padding: 1rem; border-radius: 0.5rem;}
                            p { font-size: 14px; color: #666; }
                            .code { font-size: 48px; font-weight: bold; letter-spacing: 0.5em; margin: 20px 0; padding: 10px; border: 2px dashed #ccc; border-radius: 0.5rem; }
                        }
                    </style>
                </head>
                <body>
                    <h2>Grant Service Access to Your Vehicle</h2>
                    <p>Have your authorized dealer scan the QR code and then provide them with the one-time access code below.</p>
                    <img src="${qrCodeUrl}" alt="Vehicle Access QR Code">
                    ${accessCode ? `<div class="code">${accessCode}</div>` : ''}
                </body>
            </html>
        `);
        printWindow?.document.close();
        printWindow?.print();
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Share with Dealer (Secure)</CardTitle>
                        <CardDescription>Generate a temporary code for one-time access.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {disabled ? (
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Sharing Disabled</AlertTitle>
                        <AlertDescription>
                            You have disabled sharing with dealers in the Consent Management settings. Enable it to generate a new QR code.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <>
                        <div className="flex justify-center items-center p-4 bg-muted/50 rounded-lg">
                            {accessCode ? (
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-2">Provide this code to the dealer:</p>
                                    <div className="font-mono text-5xl font-bold tracking-widest bg-background p-4 rounded-lg">
                                        {accessCode}
                                    </div>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-destructive font-medium">
                                        <Timer className="h-5 w-5"/>
                                        <span>Expires in: {formatTime(timer)}</span>
                                    </div>
                                </div>
                            ) : (
                                qrCodeUrl ? (
                                    <div className="text-center space-y-4">
                                        <Image src={qrCodeUrl} alt="Vehicle Access QR Code" width={200} height={200} className="rounded-md mx-auto" />
                                        <p className="text-xs text-muted-foreground">
                                           A dealer can scan this to begin the access process. You will then generate a temporary code for them.
                                        </p>
                                    </div>
                                ) : null
                            )}
                        </div>
                    </>
                )}
            </CardContent>
             <CardFooter className="flex flex-col gap-2">
                 <Button className="w-full" onClick={generateAccessCode} disabled={disabled || !!accessCode}>
                    {accessCode ? "Code is active" : "Generate Access Code"}
                </Button>
                 <Button variant="outline" className="w-full" onClick={handlePrint} disabled={!qrCodeUrl || disabled}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Code & QR
                </Button>
            </CardFooter>
        </Card>
    );
}
