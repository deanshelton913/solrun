import type { Metadata } from 'next';

import { siteConfig } from '@/constant/config';

export const metadata: Metadata = {
  title: 'Explore Weather',
  description:
    'Compare weather across top travel destinations. Pick your city, choose forecast days, and see where the weather is best—with flight price checks.',
  alternates: { canonical: `${siteConfig.url}/weather` },
  openGraph: {
    title: 'Explore Weather | SolRun',
    description:
      'Compare weather across top travel destinations. Pick your city and see where the weather is best.',
    url: `${siteConfig.url}/weather`,
  },
};

export default function WeatherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
