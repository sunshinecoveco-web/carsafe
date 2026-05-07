import type { Vehicle } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { ArrowRight } from "lucide-react";

export function VehicleList({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle, index) => (
        <Link key={vehicle.id} href={`/dashboard/vehicles/${vehicle.id}`} className="group block">
          <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary">
            <div className="relative h-48 w-full">
               <Image
                src={vehicle.imageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={vehicle.imageHint}
                priority={index < 3}
              />
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{vehicle.make} {vehicle.model}</span>
                <Badge variant="secondary">{vehicle.year}</Badge>
              </CardTitle>
              <CardDescription>{vehicle.vin}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    View Details <ArrowRight className="ml-1 h-4 w-4" />
                </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
