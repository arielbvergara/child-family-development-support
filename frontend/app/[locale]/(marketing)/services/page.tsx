import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  ClipboardList,
  School,
  ArrowRight,
  Monitor,
  MapPin,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { JsonLd } from '@/components/seo/JsonLd';
import { createMetadata } from '@/lib/metadata';
import { buildBreadcrumbSchema } from '@/lib/seo';
import { SERVICES, SERVICE_PAGES, SITE_CONFIG } from '@/lib/constants';
import type { Locale } from '@/lib/types';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return createMetadata('services', locale as Locale, {
    alternates: {
      canonical: `/${locale}/services`,
      languages: { nl: '/nl/services', en: '/en/services', de: '/de/services' },
    },
  });
}

const BREADCRUMB_NAMES: Record<string, { home: string; services: string }> = {
  nl: { home: 'Home', services: 'Diensten' },
  en: { home: 'Home', services: 'Services' },
  de: { home: 'Startseite', services: 'Leistungen' },
};

const serviceSlugMap = Object.fromEntries(
  SERVICE_PAGES.map((s) => [s.id, s.slug]),
);

const iconMap = {
  Users,
  BookOpen,
  ClipboardList,
  School,
} as const;

const iconColorClasses = [
  'bg-sage-100 text-primary',
  'bg-coral-100 text-coral-600',
  'bg-sky-100 text-sky-700',
  'bg-warm-200 text-warm-700',
] as const;

function buildCollectionPageSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name:
      locale === 'de'
        ? 'Leistungen'
        : locale === 'en'
          ? 'Services'
          : 'Diensten',
    url: `${SITE_CONFIG.siteUrl}/${locale}/services`,
    isPartOf: { '@id': `${SITE_CONFIG.siteUrl}/#website` },
    provider: { '@id': `${SITE_CONFIG.siteUrl}/#person` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: SERVICE_PAGES.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_CONFIG.siteUrl}/${locale}/services/${s.slug}`,
      })),
    },
  };
}

function PageHero() {
  const t = useTranslations('servicesPage');
  return (
    <div className="bg-gradient-to-br from-sage-50 to-warm-100 py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-warm-900 sm:text-5xl">
          {t('pageTitle')}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-warm-600">
          {t('pageSubtitle')}
        </p>
      </div>
    </div>
  );
}

function ServicesList({ locale }: { locale: string }) {
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const tPage = useTranslations('servicesPage');

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <p className="mx-auto mb-12 max-w-3xl text-center text-lg leading-relaxed text-warm-700">
        {tPage('intro')}
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((service, index) => {
          const Icon = iconMap[service.icon as keyof typeof iconMap] ?? Users;
          const iconColor = iconColorClasses[index % iconColorClasses.length];

          return (
            <Card key={service.id} hover className="relative flex flex-col">
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconColor}`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {service.online && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                    <Monitor className="h-3 w-3" aria-hidden="true" />
                    {tCommon('online')}
                  </span>
                )}
                {service.inPerson && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warm-100 px-2 py-0.5 text-xs font-medium text-warm-700">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {tCommon('inPerson')}
                  </span>
                )}
              </div>

              <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">
                {t(service.titleKey as Parameters<typeof t>[0])}
              </h3>
              <p className="flex-1 text-sm leading-relaxed text-warm-600">
                {t(service.descriptionKey as Parameters<typeof t>[0])}
              </p>

              <Link
                href={`/${locale}/services/${serviceSlugMap[service.id]}`}
                aria-label={`${tPage('exploreService')} — ${t(service.titleKey as Parameters<typeof t>[0])}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-hover after:absolute after:inset-0 after:rounded-2xl after:content-['']"
              >
                {tPage('exploreService')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;
  const names = BREADCRUMB_NAMES[locale] ?? BREADCRUMB_NAMES.nl;

  return (
    <>
      <JsonLd schema={buildCollectionPageSchema(locale)} />
      <JsonLd
        schema={buildBreadcrumbSchema(locale, [
          { name: names.home, path: '' },
          { name: names.services, path: '/services' },
        ])}
      />
      <PageHero />
      <ServicesList locale={locale} />
    </>
  );
}
