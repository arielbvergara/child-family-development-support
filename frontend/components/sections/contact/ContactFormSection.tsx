import { useTranslations } from 'next-intl';
import { ContactForm } from '@/components/ui/ContactForm';

export function ContactFormSection() {
  const t = useTranslations('contact.form');

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">
        {t('title')}
      </h2>
      <ContactForm />
    </div>
  );
}
