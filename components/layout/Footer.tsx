'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { localeNames } from '@/i18n/request';

export default function Footer() {
    const t = useTranslations('footer');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    const switchLocale = (newLocale: string) => {
        // Remove current locale from pathname and add new one
        const pathWithoutLocale = pathname.replace(`/${locale}`, '');
        router.push(`/${newLocale}${pathWithoutLocale}`);
    };

    return (
        <footer className="relative z-10 mt-auto pb-6 px-4">
            <div className="container mx-auto max-w-5xl">
                <div className="bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-8 md:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Pathways Health</h3>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                                {t('tagline')}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">{t('quickLinks')}</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link href={`/${locale}/assessment`} className="hover:text-resilience-green transition-colors">{t('startAssessment')}</Link></li>
                                <li><Link href={`/${locale}/dashboard`} className="hover:text-resilience-green transition-colors">{t('dashboard')}</Link></li>
                                <li><Link href="https://www.who.int/teams/environment-climate-change-and-health/climate-change-and-health" className="hover:text-resilience-green transition-colors">{t('whoGuidance')}</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">{t('legalContact')}</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link href={`/${locale}/privacy-policy`} className="hover:text-resilience-green transition-colors">{t('privacyPolicy')}</Link></li>
                                <li><Link href={`/${locale}/terms-of-service`} className="hover:text-resilience-green transition-colors">{t('termsOfUse')}</Link></li>
                                <li><Link href="mailto:info@fourbic.com" className="hover:text-resilience-green transition-colors">{t('contactUs')}</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                        <p>{t('copyright', { year: 2025 })}</p>
                        <div className="flex items-center gap-4">
                            {Object.entries(localeNames).map(([code, name]) => (
                                <button
                                    key={code}
                                    onClick={() => switchLocale(code)}
                                    className={`hover:text-white cursor-pointer transition-colors ${locale === code ? 'text-white font-semibold' : ''
                                        }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
