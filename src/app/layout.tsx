import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { JsonLd } from '@/components/seo/JsonLd';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://upton.wirsumatmo.tech';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'UP-TON — Fast, Free & Ephemeral File Sharing (Images & Videos)',
    template: '%s | UP-TON — Free File Sharing',
  },
  description:
    'Free, ultra-fast, and secure file sharing for images and videos. Upload up to 500MB without registration. Choose custom auto-expiration (1 hour to 30 days or permanent) and stream videos instantly.',
  keywords: [
    'file sharing',
    'free file sharing',
    'ephemeral file upload',
    'temporary file share',
    'upload image free',
    'upload video fast',
    'catbox alternative',
    'streamable alternative',
    'imgur alternative',
    'file.io alternative',
    'share video link',
    'auto expire file upload',
    'secure file sharing',
    'anonymous file upload',
    'no sign up file sharing',
    'kirim file cepat',
    'upload video gratis',
    'berbagi file online',
    'upton',
    'up-ton',
    'upton file sharing',
    'wirsumatmo tech',
    'atmo',
    'jasa pembuatan website',
    'jasa web app profesional',
    'software house indonesia',
    'tech consultant indonesia',
  ],
  authors: [{ name: 'UP-TON', url: APP_URL }],
  creator: 'UP-TON',
  publisher: 'UP-TON',
  applicationName: 'UP-TON File Sharing',
  category: 'productivity',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'UP-TON — Fast, Free & Ephemeral File Sharing (Images & Videos)',
    description:
      'Upload images and videos up to 500MB. Share them instantly with a unique link. Choose exact auto-expiration and enjoy buffer-free HTML5 video streaming.',
    url: APP_URL,
    siteName: 'UP-TON',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'UP-TON — Fast, Free & Ephemeral File Sharing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UP-TON — Fast, Free & Ephemeral File Sharing',
    description:
      'Free, instantaneous image & video sharing with configurable auto-expiration. Zero account or registration required.',
    creator: '@fathoniwasl',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google4fa48911b3d5b06f',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd />
      </head>
      <body className="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-zinc-200 selection:text-zinc-900 dark:selection:bg-zinc-800 dark:selection:text-white transition-colors duration-150 overflow-x-hidden w-full max-w-full">
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

