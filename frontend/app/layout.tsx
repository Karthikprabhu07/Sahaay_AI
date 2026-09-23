import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sahaay: Benefits Navigator',
  description: 'Voice-first benefits-navigator agent',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
