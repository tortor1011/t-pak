import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-app',
});

export const metadata: Metadata = {
  title: 'Estate Clarity — Dormitory Manager',
  description: 'Premium Dormitory Management ERP System for Building Owners and Administrators',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className={`${kanit.variable} min-h-full flex flex-col bg-surface text-on-surface`}>
        {children}
      </body>
    </html>
  );
}
