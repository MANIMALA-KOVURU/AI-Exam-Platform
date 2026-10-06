import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000'),
  applicationName: 'AI Examination Platform',
  title: {
    default: 'AI Examination Platform',
    template: '%s | AI Examination Platform',
  },
  description: 'AI-powered multilingual examination platform for students, examiners and administrators.',
  manifest: '/manifest.json',
  keywords: ['AI exam', 'exam platform', 'proctoring', 'assessment'],
  themeColor: '#0b6e4f',
  colorScheme: 'light',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI Exam',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="app-body">{children}</body>
    </html>
  );
}
