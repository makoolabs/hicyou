import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh', 'ja', 'ko'],
  defaultLocale: 'en',
  localePrefix: 'always', // /en/about, /zh/about — consistent for SEO
});
