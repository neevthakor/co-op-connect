import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: "Co-opConnect — Trusted Workers. Fair Opportunities. Stronger Cooperatives.",
  description: "Cooperative-owned digital marketplace connecting customers with verified, trusted workers for household and community services.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';
  let messages = {};
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (e) {
    messages = (await import(`../../messages/en.json`)).default;
  }
  return (
    <html lang={locale} data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`font-sans antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('SW registered: ', registration.scope);
                }, function(err) {
                  console.log('SW registration failed: ', err);
                });
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
