import type { Metadata } from 'next';
import './globals.css';
import { FirebaseAppProvider } from '@/components/providers/firebase-app-provider';

export const metadata: Metadata = {
  title: 'CarSafe',
  description: 'Digital vehicle management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <FirebaseAppProvider>
          {children}
        </FirebaseAppProvider>
      </body>
    </html>
  );
}
