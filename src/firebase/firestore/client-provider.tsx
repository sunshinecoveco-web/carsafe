
'use client';

import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { useMemo } from 'react';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebase = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider {...firebase}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
