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
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --background: 210 20% 98%; --foreground: 222 47% 11%;
            --card: 0 0% 100%; --card-foreground: 222 47% 11%;
            --popover: 0 0% 100%; --popover-foreground: 222 47% 11%;
            --primary: 221 83% 53%; --primary-foreground: 0 0% 100%;
            --secondary: 210 40% 96%; --secondary-foreground: 222 47% 11%;
            --muted: 210 40% 96%; --muted-foreground: 215 16% 47%;
            --accent: 210 40% 96%; --accent-foreground: 222 47% 11%;
            --destructive: 0 84% 60%; --destructive-foreground: 0 0% 100%;
            --border: 214 32% 91%; --input: 214 32% 91%; --ring: 221 83% 53%;
            --radius: 0.5rem;
          }
          *, *::before, *::after { box-sizing: border-box; }
          body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); font-family: Inter, system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
        `}} />
      </head>
      <body>
        <FirebaseAppProvider>
          {children}
        </FirebaseAppProvider>
      </body>
    </html>
  );
}
