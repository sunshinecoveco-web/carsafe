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
        <script dangerouslySetInnerHTML={{ __html: `
          window.tailwind = {
            config: {
              darkMode: ['class'],
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                  },
                  colors: {
                    background:  'hsl(var(--background))',
                    foreground:  'hsl(var(--foreground))',
                    card:        { DEFAULT: 'hsl(var(--card))',        foreground: 'hsl(var(--card-foreground))' },
                    popover:     { DEFAULT: 'hsl(var(--popover))',     foreground: 'hsl(var(--popover-foreground))' },
                    primary:     { DEFAULT: 'hsl(var(--primary))',     foreground: 'hsl(var(--primary-foreground))' },
                    secondary:   { DEFAULT: 'hsl(var(--secondary))',   foreground: 'hsl(var(--secondary-foreground))' },
                    muted:       { DEFAULT: 'hsl(var(--muted))',       foreground: 'hsl(var(--muted-foreground))' },
                    accent:      { DEFAULT: 'hsl(var(--accent))',      foreground: 'hsl(var(--accent-foreground))' },
                    destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
                    border: 'hsl(var(--border))',
                    input:  'hsl(var(--input))',
                    ring:   'hsl(var(--ring))',
                  },
                  borderRadius: {
                    lg: 'var(--radius)',
                    md: 'calc(var(--radius) - 2px)',
                    sm: 'calc(var(--radius) - 4px)',
                  },
                  keyframes: {
                    'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
                    'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
                  },
                  animation: {
                    'accordion-down': 'accordion-down 0.2s ease-out',
                    'accordion-up':   'accordion-up 0.2s ease-out',
                  },
                },
              },
            }
          };
        `}} />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdn.tailwindcss.com" />
      </head>
      <body>
        <FirebaseAppProvider>
          {children}
        </FirebaseAppProvider>
      </body>
    </html>
  );
}
