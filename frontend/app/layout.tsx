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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
