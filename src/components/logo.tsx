"use client";

import { Car } from "lucide-react";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-blue-700 transition-colors">
        <Car className="h-4 w-4 text-white" />
      </div>
      <span className="font-bold text-xl tracking-tight leading-none">
        Car<span className="text-blue-600">Safe</span>
      </span>
    </Link>
  );
}
