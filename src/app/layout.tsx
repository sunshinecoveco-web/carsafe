
import "./globals.css"

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
    
    const storedAuth = localStorage.getItem('carsafe_user');
    if (storedAuth) {
      try {
        const parsedAuth: AuthState = JSON.parse(storedAuth);
        if (parsedAuth.isAuthenticated) {
          setAuth(parsedAuth);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setIsCheckingAuth(false);
  }, [isClient, router]);

  if (!isClient || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <Skeleton className="h-16 w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 pt-20">
        {children}
      </main>
    </div>
  );
}
