
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Construction } from "lucide-react";

export function IncentivesCard() {
    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Gift className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Exclusive Owner Incentives</CardTitle>
                        <CardDescription>Loyalty rewards from your service partners.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 h-full bg-muted/50 rounded-lg">
                    <Construction className="h-12 w-12 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">Feature Coming Soon!</h3>
                    <p className="mt-2 text-sm">
                        This is where you'll find exclusive discounts, special offers, and loyalty rewards from your verified service dealers as a thank you for your continued business.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
