import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Only available in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Verify email is in ADMIN_EMAILS
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    if (!adminEmails.length) {
      return NextResponse.json({
        error: 'ADMIN_EMAILS not configured. Set it in .env first.',
      }, { status: 400 });
    }

    if (!adminEmails.includes(email.toLowerCase())) {
      return NextResponse.json({
        error: `"${email}" is not in ADMIN_EMAILS. Allowed: ${adminEmails.join(', ')}`,
      }, { status: 403 });
    }

    // Set dev session cookie (httpOnly, expires in 24h)
    const response = NextResponse.json({ success: true });
    response.cookies.set('dev_user_email', email, {
      httpOnly: true,
      secure: false, // localhost
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
