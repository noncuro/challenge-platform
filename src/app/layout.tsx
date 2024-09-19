import { Navbar } from '@/components/Navbar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container mx-auto mt-8 min-h-full">
          {children}
        </main>
      </body>
    </html>
  );
}
