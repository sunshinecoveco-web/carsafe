import Logo from '@/components/logo';
import '../globals.css';

export const metadata = {
  title: 'CarSafe - Public Vehicle View',
  description: 'Public view of a vehicle for sale.',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <div className="flex flex-col min-h-screen">
          <header className="py-4 border-b">
            <div className="container mx-auto px-4 sm:px-6">
                <Logo />
            </div>
          </header>
          <main className="flex-1 py-8">
            <div className="container mx-auto px-4 sm:px-6">
              {children}
            </div>
          </main>
          <footer className="py-6 border-t">
            <div className="container mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} CarSafe. All rights reserved.</p>
            </div>
         </footer>
        </div>
      </body>
    </html>
  );
}
