import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
    en: 'En',
    sw: 'Sw',
    fr: 'Fr'
};

export default getRequestConfig(async ({ requestLocale }) => {
    // Typically corresponds to the `[locale]` segment
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
