import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function RootPage() {
  // With localePrefix 'as-needed', default locale has no prefix
  // Redirect to the [locale] handler for default locale
  redirect(`/${routing.defaultLocale}`);
}
