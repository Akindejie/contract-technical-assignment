import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Financial Dashboard',
  description: 'A comprehensive financial management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="lg:ml-64 transition-all duration-300">
              <Header />
              <main className="container mx-auto p-4 lg:p-8">{children}</main>
            </div>
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
