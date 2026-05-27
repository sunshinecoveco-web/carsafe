import { Car } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Car className="h-4 w-4 text-white" />
      </div>
      <span className="font-bold text-xl tracking-tight leading-none">
        Car<span className="text-blue-600">Safe</span>
      </span>
    </div>
  );
}
