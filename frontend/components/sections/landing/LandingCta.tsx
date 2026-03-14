import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface LandingCtaProps {
  locale: string;
}

export function LandingCta({ locale }: LandingCtaProps) {
  const t = useTranslations('cta');

  return (
    <section
      aria-labelledby="cta-heading"
      className="bg-primary px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="cta-heading"
          className="font-display text-3xl font-bold text-white sm:text-4xl"
        >
          {t('headline')}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-sage-100">
          {t('subheadline')}
        </p>
        <div className="mt-8">
          <Button href={`/${locale}/contact`} variant="white" size="lg">
            {t('button')}
          </Button>
        </div>
      </div>
    </section>
  );
}
