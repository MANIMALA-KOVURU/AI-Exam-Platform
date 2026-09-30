import type { Metadata, Viewport } from 'next';
import { LocaleProvider } from '../components/LocaleProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Examination Platform',
  description: 'AI-Based Intelligent Examination Platform with Automated Proctoring and Candidate Performance Analysis',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'AI Exam Platform' },
  applicationName: 'AI Examination Platform',
  icons: {
    icon: [
      { url: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: '/icons/icon-192.svg',
  },
};

export const viewport: Viewport = { themeColor: '#0b6e4f' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="app-body"><LocaleProvider>{children}</LocaleProvider></body>
    </html>
  );
}
