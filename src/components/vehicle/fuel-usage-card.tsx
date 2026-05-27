
"use client";

import { useState, useMemo } from "react";
import type { Vehicle, FuelProjectionOutput } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fuel, Zap, TrendingUp, Loader2, Bot, AlertCircle } from "lucide-react";
import { projectFuelUsage } from "@/ai/flows/fuel-projection";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FuelUsageCard({ vehicle }: { vehicle: Vehicle }) {
    const [loading, setLoading] = useState(false);
    const [projection, setProjection] = useState<FuelProjectionOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isEV = vehicle.make.toLowerCase().includes('tesla') || 
                 vehicle.model.toLowerCase().includes('electric') || 
                 vehicle.model.toLowerCase().includes('ev');

    const chartData = useMemo(() => {
        return [...vehicle.fuelHistory]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(record => ({
                date: format(parseISO(record.date), "MMM d"),
                cost: record.cost,
                amount: record.amount,
            }));
    }, [vehicle.fuelHistory]);

    const handleGetProjection = async () => {
        setLoading(true);
        setError(null);
        try {
            const historyStr = vehicle.fuelHistory
                .map(r => `${r.date}, ${r.amount}, ${r.cost}, ${r.odometer}`)
                .join('\n');

            const result = await projectFuelUsage({
                make: vehicle.make,
                model: vehicle.model,
                fuelHistory: historyStr || "No history available."
            });
            setProjection(result);
        } catch (e) {
            console.error(e);
            setError("Failed to generate AI projection. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isEV ? <Zap className="h-6 w-6 text-yellow-500" /> : <Fuel className="h-6 w-6 text-primary" />}
                        <div>
                            <CardTitle>{isEV ? 'Energy Consumption' : 'Fuel Usage'}</CardTitle>
                            <CardDescription>Track efficiency and projected costs.</CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
                <div style={{ height: '224px', width: '100%' }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: "#6b7280" }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    yAxisId="cost"
                                    orientation="left"
                                    tick={{ fontSize: 11, fill: "#6b7280" }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `$${v}`}
                                />
                                <YAxis
                                    yAxisId="amount"
                                    orientation="right"
                                    tick={{ fontSize: 11, fill: "#6b7280" }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                    labelStyle={{ fontWeight: 600, color: "#111827" }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                                    formatter={(value) => <span style={{ color: "#374151" }}>{value}</span>}
                                />
                                <Line
                                    yAxisId="cost"
                                    type="monotone"
                                    dataKey="cost"
                                    name="Spend ($)"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    yAxisId="amount"
                                    type="monotone"
                                    dataKey="amount"
                                    name={isEV ? "kWh" : "Gallons"}
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                            No consumption data available.
                        </div>
                    )}
                </div>

                {projection && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Efficiency</p>
                            <p className="text-lg font-bold">{projection.currentEfficiency}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Next 30 Days</p>
                            <p className="text-lg font-bold text-primary">${projection.projectedMonthlyCost.toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {projection && (
                    <Alert className="bg-primary/5 border-primary/20">
                        <Bot className="h-4 w-4" />
                        <AlertTitle>AI Insights</AlertTitle>
                        <AlertDescription className="text-xs italic">
                            "{projection.insight}"
                        </AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" onClick={handleGetProjection} disabled={loading || chartData.length === 0}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Patterns...
                        </>
                    ) : (
                        <>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            {projection ? "Refresh AI Projection" : "Analyze Usage Patterns"}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
