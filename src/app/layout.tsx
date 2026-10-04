import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'UPTON — Minimal, Fast & Ephemeral File Sharing',
  description:
    'Simple, beautiful, and secure file sharing for images and videos with configurable expiration and local storage.',
  keywords: ['file sharing', 'temporary files', 'upfile', 'upton', 'catbox', 'image upload', 'video upload'],
  openGraph: {
    title: 'UPTON — Minimal, Fast & Ephemeral File Sharing',
    description: 'Upload images and videos. Share them instantly. Choose exactly when they disappear.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-zinc-200 selection:text-zinc-900 dark:selection:bg-zinc-800 dark:selection:text-white transition-colors duration-150">
        <ThemeProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
