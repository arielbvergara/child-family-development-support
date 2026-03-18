import { describe, it, expect } from 'vitest';
import { getLocalizedPath, LOCALIZED_PATHNAMES } from '@/lib/pathnames';

describe('LOCALIZED_PATHNAMES', () => {
  it('LOCALIZED_PATHNAMES_ShouldContainAppointmentPaths_WhenAccessed', () => {
    expect(LOCALIZED_PATHNAMES).toHaveProperty('/make-an-appointment');
    expect(LOCALIZED_PATHNAMES['/make-an-appointment']).toEqual({
      nl: '/afspraak-maken',
      en: '/make-an-appointment',
      de: '/termin-vereinbaren',
    });
  });
});

describe('getLocalizedPath', () => {
  it('getLocalizedPath_ShouldReturnDutchSlug_WhenLocaleIsNl', () => {
    expect(getLocalizedPath('/make-an-appointment', 'nl')).toBe('/afspraak-maken');
  });

  it('getLocalizedPath_ShouldReturnEnglishSlug_WhenLocaleIsEn', () => {
    expect(getLocalizedPath('/make-an-appointment', 'en')).toBe('/make-an-appointment');
  });

  it('getLocalizedPath_ShouldReturnGermanSlug_WhenLocaleIsDe', () => {
    expect(getLocalizedPath('/make-an-appointment', 'de')).toBe('/termin-vereinbaren');
  });

  it('getLocalizedPath_ShouldReturnOriginalPath_WhenPathHasNoLocalizedVariant', () => {
    expect(getLocalizedPath('/about', 'nl')).toBe('/about');
    expect(getLocalizedPath('/contact', 'en')).toBe('/contact');
    expect(getLocalizedPath('/services', 'de')).toBe('/services');
  });

  it('getLocalizedPath_ShouldReturnOriginalPath_WhenLocaleIsUnknown', () => {
    expect(getLocalizedPath('/make-an-appointment', 'fr')).toBe('/make-an-appointment');
  });
});
