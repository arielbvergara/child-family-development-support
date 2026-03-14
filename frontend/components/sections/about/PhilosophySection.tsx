import { useTranslations } from 'next-intl';
import { Heart, Home, Microscope } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { PHILOSOPHY_PILLARS } from '@/lib/constants';

const iconMap = { Heart, Home, Microscope } as const;

export function PhilosophySection() {
  const t = useTranslations();

  return (
    <SectionWrapper className="bg-sage-50">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Heading level={2} className="mb-4">
          {t('about.philosophy.title')}
        </Heading>
        <p className="text-lg text-warm-600">{t('about.philosophy.subtitle')}</p>
      </div>

      <div className="grid gap-8 sm:grid-cols-3">
        {PHILOSOPHY_PILLARS.map((pillar) => {
          const Icon = iconMap[pillar.icon as keyof typeof iconMap] ?? Heart;
          return (
            <div key={pillar.titleKey} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                <Icon className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">
                {t(pillar.titleKey as Parameters<typeof t>[0])}
              </h3>
              <p className="text-sm leading-relaxed text-warm-600">
                {t(pillar.descKey as Parameters<typeof t>[0])}
              </p>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
