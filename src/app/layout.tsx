import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { FeedbackProvider } from '@/context/FeedbackContext';
import { Navigation } from '@/components/Navigation';
import { NavigationProgressBar } from '@/components/NavigationProgressBar';
import { Footer } from '@/components/Footer';
import { Suspense } from 'react';

const isIndexable = process.env.SITE_INDEXABLE === 'true';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const viewport: Viewport = {
  themeColor: '#8C3A27',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dust and Dazzle — Short Stories by Ajeet Kumar Singh',
    template: '%s | Dust and Dazzle',
  },
  description:
    'Tales from a Village and a City. A literary memoir and short story collection exploring rural roots, urban migration, memory, and time by Ajeet Kumar Singh.',
  authors: [{ name: 'Ajeet Kumar Singh' }],
  creator: 'Ajeet Kumar Singh',
  publisher: 'Dust and Dazzle Press',
  applicationName: 'Dust and Dazzle',
  keywords: [
    'Dust and Dazzle',
    'Ajeet Kumar Singh',
    'Indian Literature',
    'Short Stories',
    'Village Stories',
    'Memoir',
    'Literary Fiction',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Dust and Dazzle',
    title: 'Dust and Dazzle — Tales from a Village and a City',
    description:
      'A literary memoir and short story collection by Ajeet Kumar Singh, tracing the arc of memory between village dust and city light.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dust and Dazzle — Tales from a Village and a City',
    description:
      'A literary memoir and short story collection by Ajeet Kumar Singh.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dust and Dazzle',
  },
  robots: isIndexable
    ? {
        index: true,
        follow: true,
      }
    : {
        index: false,
        follow: false,
        nocache: true,
      },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Playfair+Display:ital,wght@0,400..800;1,400..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="paper-texture min-h-screen flex flex-col text-[var(--text-primary)] font-serif antialiased transition-colors duration-300">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--color-terracotta)] text-[var(--color-terracotta)] font-serif text-xs uppercase tracking-wider shadow-lg rounded-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-terracotta)]"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <FeedbackProvider>
            <Suspense fallback={null}>
              <NavigationProgressBar />
            </Suspense>
            <Navigation />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </FeedbackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
