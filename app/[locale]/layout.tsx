import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import Footer from "@/components/layout/Footer";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // Await params in Next.js 16+
    const { locale } = await params;

    // Validate locale using hasLocale
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    // Import messages directly
    let messages;
    try {
        messages = (await import(`../../messages/${locale}.json`)).default;
    } catch (error) {
        console.error('Failed to load messages:', error);
        messages = {};
    }

    return (
        <html lang={locale}>
            <body className={`${inter.className} flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50`}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <Header />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
