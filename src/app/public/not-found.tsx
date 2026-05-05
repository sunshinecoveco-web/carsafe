import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-3xl font-bold mb-2">Vehicle Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The vehicle you are looking for does not exist or the link is incorrect.
      </p>
      <Button asChild>
        <Link href="/">Return to Homepage</Link>
      </Button>
    </div>
  );
}
