import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { Heading } from '@/components/ui/Heading';
import { Badge } from '@/components/ui/Badge';

interface AboutTeaserProps {
  locale: string;
}

export function AboutTeaser({ locale }: AboutTeaserProps) {
  const t = useTranslations('aboutTeaser');

  const credentials = t.raw('credentials') as string[];

  return (
    <SectionWrapper className="bg-warm-50">
      <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
        {/* Photo placeholder */}
        <div className="order-2 md:order-1">
          <div
            className="relative mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-sage-100 to-warm-200 shadow-lg"
            aria-label="Photo of the pedagogy professional"
          >
            {/* Placeholder content */}
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sage-200 text-sage-600">
                <GraduationCap className="h-12 w-12" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-warm-500">
                Foto volgt binnenkort
              </p>
            </div>

            {/* Decorative overlay */}
            <div
              aria-hidden="true"
              className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-sage-300/30 blur-2xl"
            />
          </div>
        </div>

        {/* Content */}
        <div className="order-1 md:order-2">
          <Heading level={2} className="mb-5">
            {t('sectionTitle')}
          </Heading>

          <p className="mb-6 text-lg leading-relaxed text-warm-600">
            {t('bio')}
          </p>

          {/* Credential badges */}
          <div className="mb-8 flex flex-wrap gap-2">
            {credentials.map((cred: string) => (
              <Badge key={cred} variant="sage">
                {cred}
              </Badge>
            ))}
          </div>

          <Link
            href={`/${locale}/about`}
            className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            {t('linkText')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
