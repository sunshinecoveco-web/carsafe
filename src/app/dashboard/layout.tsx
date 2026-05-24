
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/header';
import { Skeleton } from '@/components/ui/skeleton';
import type { AuthState } from '@/hooks/use-auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkAuth = () => {
      const storedAuth = localStorage.getItem('carsafe_user');
      let isAuthenticated = false;
      if (storedAuth) {
          try {
              const parsedAuth: AuthState = JSON.parse(storedAuth);
              isAuthenticated = parsedAuth.isAuthenticated;
              setAuth(parsedAuth);
          } catch (e) {
              isAuthenticated = false;
          }
      }
      
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, isClient]);

  if (!isClient || isCheckingAuth || !auth?.isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
            </div>
        </header>
        <main className="flex-1 container py-8">
            <Skeleton className="w-1/2 h-8 mb-6" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      
      <main className="flex-1">{children}</main>
    </div>
  );
}
