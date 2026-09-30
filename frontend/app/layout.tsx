import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Examination Platform',
  description: 'AI-powered multilingual examination platform',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="app-body">{children}</body>
    </html>
  );
}
