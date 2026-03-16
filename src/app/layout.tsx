import type { Metadata } from 'next';
import type * as React from 'react';

import '@/styles/colors.css';
import '@/styles/globals.css';

import { AdSenseScript } from '@/components/ads/AdSenseScript';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

import { QueryProvider } from '@/app/providers/QueryProvider';
import { siteConfig } from '@/constant/config';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  keywords: [
    'weather',
    'travel',
    'forecast',
    'destinations',
    'flight prices',
    'vacation planning',
  ],
  authors: [{ name: 'SolRun', url: siteConfig.url }],
  creator: 'SolRun',
  robots: { index: true, follow: true },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  manifest: `/favicon/site.webmanifest`,
  openGraph: {
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    images: [`${siteConfig.url}/images/og.jpg`],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteConfig.url}/images/og.jpg`],
  },
  alternates: { canonical: siteConfig.url },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <meta name='google-adsense-account' content='ca-pub-4839017856652678' />
      </head>
      <body className='min-h-screen flex flex-col bg-surface-page'>
        <AdSenseScript />
        <QueryProvider>
          <SiteHeader />
          <div className='flex-1'>{children}</div>
          <SiteFooter />
        </QueryProvider>
      </body>
    </html>
  );
}
