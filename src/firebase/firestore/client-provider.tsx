
'use client';

import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { useMemo } from 'react';



export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebase = useMemo(() => initializeFirebase(), []);

  return (

 <FirebaseProvider {...firebase}>
    {children}
    </FirebaseProvider>
  );
}
