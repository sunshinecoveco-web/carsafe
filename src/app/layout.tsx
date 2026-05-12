export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body style={{ background: 'white', color: 'black', padding: 50 }}>
        <h1>CARSAFE TEST</h1>
        {children}
      </body>
    </html>
  );
}
