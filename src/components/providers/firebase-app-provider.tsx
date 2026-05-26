'use client';

import { FirebaseProvider } from '@/firebase/provider';
import { app, auth, db } from '@/lib/firebase';
import type { ReactNode } from 'react';

export function FirebaseAppProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider app={app} auth={auth} firestore={db}>
      {children}
    </FirebaseProvider>
  );
}
