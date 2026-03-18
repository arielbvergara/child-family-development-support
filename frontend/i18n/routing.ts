import { defineRouting } from 'next-intl/routing';
import { LOCALIZED_PATHNAMES } from '../lib/pathnames';

export const routing = defineRouting({
  locales: ['nl', 'en', 'de'],
  defaultLocale: 'nl',
  pathnames: LOCALIZED_PATHNAMES,
});
