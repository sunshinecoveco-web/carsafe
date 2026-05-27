"use client";

import { useState, useEffect, useMemo } from "react";
import type { Vehicle, ServiceCategory } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { Skeleton } from "../ui/skeleton";
import { DollarSign, Tag } from "lucide-react";

interface ChartData {
  category: string;
  totalCost: number;
  fill: string;
}

const chartConfig = {
  totalCost: {
    label: "Total Cost",
    icon: DollarSign,
  },
  "Routine Maintenance": {
    label: "Maintenance",
    color: "#3b82f6",
  },
  Repairs: {
    label: "Repairs",
    color: "#ef4444",
  },
  Tires: {
    label: "Tires",
    color: "#f59e0b",
  },
  Inspection: {
    label: "Inspection",
    color: "#22c55e",
  },
  Other: {
    label: "Other",
    color: "#8b5cf6",
  },
} satisfies ChartConfig;

export function CostOfOwnershipChart({ vehicles }: { vehicles: Vehicle[] }) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const allServices = useMemo(() => {
    return vehicles.flatMap((v) => v.serviceHistory);
  }, [vehicles]);

  useEffect(() => {
    setIsLoading(true);
    if (vehicles.length === 0 || allServices.length === 0) {
      setIsLoading(false);
      setChartData([]);
      return;
    }

    const costsByCategory = allServices.reduce(
        (acc, service) => {
          const category = service.category || 'Other';
          acc[category] = (acc[category] || 0) + service.cost;
          return acc;
        },
        {} as Record<string, number>
      );

      const formattedData = Object.entries(costsByCategory)
        .map(([category, totalCost]) => ({
          category,
          totalCost,
          fill: chartConfig[category as keyof typeof chartConfig]?.color || chartConfig['Other'].color,
        }))
        .sort((a, b) => b.totalCost - a.totalCost);

      setChartData(formattedData);
      setIsLoading(false);
  }, [allServices, vehicles]);

  if (vehicles.length === 0) {
    return null; // Don't show the card if there are no vehicles
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Cost of Ownership Breakdown</CardTitle>
            <CardDescription>
              AI-categorized summary of your total vehicle expenses.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex aspect-video w-full items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} style={{ height: 240 }} className="w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="category"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(value) =>
                  chartConfig[value as keyof typeof chartConfig]?.label ?? value
                }
              />
              <YAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
                width={44}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="totalCost" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.category} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
             <Tag className="h-8 w-8 mb-2" />
             <p>No cost data available to display.</p>
             <p className="text-xs">Add service records with costs to see a breakdown.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
