import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { Heading } from '@/components/ui/Heading';
import { TRUST_STATS, TESTIMONIALS } from '@/lib/constants';

export function TrustSignals() {
  const t = useTranslations();

  return (
    <SectionWrapper className="bg-white">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Heading level={2} className="mb-3">
          {t('trust.sectionTitle')}
        </Heading>
        <p className="text-warm-600">{t('trust.sectionSubtitle')}</p>
      </div>

      {/* Stats row */}
      <div className="mb-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-3">
        {TRUST_STATS.map((stat) => (
          <div
            key={stat.valueKey}
            className="bg-warm-50 px-8 py-8 text-center"
          >
            <div className="font-display text-4xl font-bold text-primary sm:text-5xl">
              {t(stat.valueKey as Parameters<typeof t>[0])}
            </div>
            <div className="mt-2 text-sm font-medium text-warm-600">
              {t(stat.labelKey as Parameters<typeof t>[0])}
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid gap-6 sm:grid-cols-2">
        {TESTIMONIALS.map((testimonial) => (
          <figure
            key={testimonial.id}
            className="rounded-xl border border-border bg-warm-50 p-6 sm:p-8"
          >
            {/* Stars */}
            <div className="mb-4 flex gap-1" aria-label="5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-sage-400 text-sage-400"
                  aria-hidden="true"
                />
              ))}
            </div>

            <blockquote>
              <p className="text-base italic leading-relaxed text-warm-700">
                &ldquo;{t(testimonial.quoteKey as Parameters<typeof t>[0])}&rdquo;
              </p>
            </blockquote>

            <figcaption className="mt-4 flex items-center gap-3">
              {/* Avatar placeholder */}
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-200 text-sm font-bold text-sage-700"
                aria-hidden="true"
              >
                {(t(testimonial.authorKey as Parameters<typeof t>[0]) as string).charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {t(testimonial.authorKey as Parameters<typeof t>[0])}
                </div>
                <div className="text-xs text-warm-500">
                  {t(testimonial.roleKey as Parameters<typeof t>[0])}
                </div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </SectionWrapper>
  );
}
