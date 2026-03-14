import { useTranslations } from 'next-intl';
import { Award, CheckCircle } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { Badge } from '@/components/ui/Badge';
import { CREDENTIALS } from '@/lib/constants';

export function QualificationsSection() {
  const t = useTranslations();

  const credentialBadges = ['M.Ed.', 'BIG', 'NIP', 'Gecertificeerd'];

  return (
    <SectionWrapper className="bg-warm-50">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-100 text-primary">
            <Award className="h-6 w-6" aria-hidden="true" />
          </div>
          <Heading level={2}>{t('about.qualifications.title')}</Heading>
        </div>

        {/* Badge row */}
        <div className="mb-8 flex flex-wrap gap-2">
          {credentialBadges.map((badge) => (
            <Badge key={badge} variant="sage" className="text-sm px-4 py-1.5">
              {badge}
            </Badge>
          ))}
        </div>

        {/* Credential list */}
        <ul className="space-y-4">
          {CREDENTIALS.map((credential) => (
            <li
              key={credential.titleKey}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
            >
              <CheckCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium text-foreground">
                  {t(credential.titleKey as Parameters<typeof t>[0])}
                </p>
                {(credential.year || credential.institution) && (
                  <p className="mt-0.5 text-sm text-warm-500">
                    {[credential.year, credential.institution]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SectionWrapper>
  );
}
