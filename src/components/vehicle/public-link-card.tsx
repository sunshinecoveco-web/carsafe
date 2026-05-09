"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link as LucideLink, Copy, QrCode, Printer } from "lucide-react";
import { Separator } from "../ui/separator";

export function PublicLinkCard({ vehicleId }: { vehicleId: string }) {
    const { toast } = useToast();
    const [publicUrl, setPublicUrl] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState("");

    useEffect(() => {
        // This ensures window is available before constructing the URL.
        const url = `${window.location.origin}/public/vehicles/${vehicleId}`;
        setPublicUrl(url);

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

    }, [vehicleId, toast]);

    const handleCopy = () => {
        navigator.clipboard.writeText(publicUrl);
        toast({ title: "Public link copied!" });
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(`
            <html>
                <head>
                    <title>Vehicle QR Code</title>
                    <style>
                        @media print {
                            @page { size: A4; margin: 20mm; }
                            body { font-family: sans-serif; text-align: center; }
                            img { max-width: 80%; height: auto; }
                            p { font-size: 14px; word-break: break-all; }
                        }
                    </style>
                </head>
                <body>
                    <h2>Scan to View Vehicle History</h2>
                    <img src="${qrCodeUrl}" alt="Vehicle QR Code">
                    <p>${publicUrl}</p>
                </body>
            </html>
        `);
        printWindow?.document.close();
        printWindow?.print();
    };

    if (!publicUrl) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <QrCode className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Public Share Link & QR Code</CardTitle>
                        <CardDescription>Share this link or QR code with potential buyers.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center gap-2">
                    <LucideLink className="h-4 w-4 text-muted-foreground"/>
                    <Input value={publicUrl} readOnly />
                    <Button variant="outline" size="icon" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Anyone with this link can view the vehicle's verified service history.
                </p>
                {qrCodeUrl && (
                    <>
                        <Separator />
                        <div className="flex justify-center items-center p-4 bg-muted/50 rounded-lg">
                            <Image src={qrCodeUrl} alt="Vehicle QR Code" width={200} height={200} className="rounded-md" />
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter>
                 <Button variant="outline" className="w-full" onClick={handlePrint} disabled={!qrCodeUrl}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print QR Code
                </Button>
            </CardFooter>
        </Card>
    );
}
