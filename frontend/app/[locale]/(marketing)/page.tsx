import type { Metadata } from 'next';
import { Hero } from '@/components/sections/landing/Hero';
import { ServicesOverview } from '@/components/sections/landing/ServicesOverview';
import { TrustSignals } from '@/components/sections/landing/TrustSignals';
import { AboutTeaser } from '@/components/sections/landing/AboutTeaser';
import { Faq } from '@/components/sections/landing/Faq';
import { LandingCta } from '@/components/sections/landing/LandingCta';
import { createMetadata } from '@/lib/metadata';
import type { Locale } from '@/lib/types';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return createMetadata('home', locale as Locale, {
    alternates: {
      canonical: `/${locale}`,
      languages: { nl: '/nl', en: '/en', de: '/de' },
    },
  });
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <>
      <Hero locale={locale} />
      <ServicesOverview locale={locale} />
      <TrustSignals />
      <AboutTeaser locale={locale} />
      <Faq />
      <LandingCta locale={locale} />
    </>
  );
}
