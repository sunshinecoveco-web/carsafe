"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { LogOut, UserCircle, LifeBuoy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const router = useRouter();
  const auth = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('carsafe_user');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {auth.isAuthenticated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                <UserCircle className="h-5 w-5" />
                <span>Logged in as:</span>
                <Badge variant="secondary" className="capitalize">{auth.role}</Badge>
            </div>
          )}
          <Button variant="ghost" asChild>
            <Link href="/dashboard/support">
              <LifeBuoy className="mr-2 h-4 w-4" />
              Support
            </Link>
          </Button>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
