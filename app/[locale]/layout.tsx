import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Analytics } from "@vercel/analytics/react";
import "../globals.css";
import localFont from "next/font/local";

import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/footer";

import { directory } from "@/directory.config";

const font = localFont({
  src: [
    {
      path: "../fonts/GeistVF.woff",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-geist",
  display: "swap",
  fallback: ["system-ui", "arial"],
});

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const localized = directory.localized[locale as keyof typeof directory.localized] || directory.localized.en;
  const baseUrl = directory.baseUrl;

  return {
    title: localized.title,
    description: localized.description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: `${baseUrl}/en`,
        zh: `${baseUrl}/zh`,
        ja: `${baseUrl}/ja`,
        ko: `${baseUrl}/ko`,
      },
    },
    icons: {
      icon: [
        { url: '/favicon/favicon.ico' },
        { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      ],
      apple: [
        { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    openGraph: {
      title: localized.title,
      description: localized.description,
      url: `${baseUrl}/${locale}`,
      siteName: directory.name,
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ja' ? 'ja_JP' : locale === 'ko' ? 'ko_KR' : 'en_US',
      type: 'website',
      images: [
        {
          url: '/ogimage.avif',
          width: 1200,
          height: 630,
          alt: localized.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: localized.title,
      description: localized.description,
      images: ['/ogimage.avif'],
    },
    manifest: '/favicon/site.webmanifest',
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  const localized = directory.localized[locale as keyof typeof directory.localized] || directory.localized.en;
  const baseUrl = directory.baseUrl;

  // Schema.org WebSite structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: directory.name,
    url: `${baseUrl}/${locale}`,
    description: localized.description,
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/${locale}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${font.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Footer />
        </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}

