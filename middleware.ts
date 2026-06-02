import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Step 1: i18n routing
  const intlResponse = intlMiddleware(request);
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1] || routing.defaultLocale;
  const isDev = process.env.NODE_ENV === 'development';

  // Step 2: Auth (Supabase or Dev Session)
  let response = intlResponse;

  // Dev mode: read dev session cookie (set by /dev-login)
  const devEmail = isDev ? request.cookies.get('dev_user_email')?.value : null;
  let user: { email?: string } | null = null;

  if (devEmail) {
    // Mock user from dev session — reuses ADMIN_EMAILS check below
    user = { email: devEmail };
  } else {
    // Real Supabase auth
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            response = NextResponse.next({ request: { headers: request.headers } });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      }
    );
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  // Step 3: Route protection
  const isProtected = ['/hi-studio', '/account'].some(p => pathname.includes(p));
  if (isProtected && !user) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (pathname.includes('/hi-studio')) {
    const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    if (!user?.email || !admins.includes(user.email)) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  if (pathname.includes('/login') && user) {
    return NextResponse.redirect(new URL(`/${locale}/account`, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|fonts|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)'],
};
