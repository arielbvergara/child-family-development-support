import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { createMetadata } from '@/lib/metadata';
import type { Locale } from '@/lib/types';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return createMetadata('terms', locale as Locale, {
    robots: { index: false, follow: true },
    alternates: {
      canonical: `/${locale}/terms-of-service`,
      languages: {
        nl: '/nl/terms-of-service',
        en: '/en/terms-of-service',
        de: '/de/terms-of-service',
      },
    },
  });
}

function LegalContent() {
  const t = useTranslations('terms');

  const sectionKeys = [
    'services',
    'payment',
    'cancellation',
    'liability',
    'disputes',
  ] as const;

  return (
    <article className="prose mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-2">
        {t('pageTitle')}
      </h1>
      <p className="text-sm text-warm-500 mb-8">{t('lastUpdated')}</p>

      <p className="text-base leading-relaxed text-warm-700 mb-8">
        {t('intro')}
      </p>

      {sectionKeys.map((key) => (
        <section key={key}>
          <h2>{t(`sections.${key}.title` as Parameters<typeof t>[0])}</h2>
          <p>{t(`sections.${key}.content` as Parameters<typeof t>[0])}</p>
        </section>
      ))}
    </article>
  );
}

export default async function TermsOfServicePage({ params }: PageProps) {
  await params;

  return (
    <SectionWrapper className="bg-white" as="div">
      <LegalContent />
    </SectionWrapper>
  );
}
