import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resume AI - ATS-Optimized Resume Agent',
  description:
    'Transform your resume with AI-powered ATS optimization. Get better job matches and higher callback rates.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased bg-white text-slate-900">{children}</body>
    </html>
  );
}
