import { NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

function resolveSubdomain(hostname) {
  if (hostname.includes('localhost')) return null;
  if (!hostname.endsWith('.ourbigday.io')) return null;

  const slug = hostname.replace('.ourbigday.io', '');
  if (!slug || slug === 'www') return null;
  return slug;
}

export async function proxy(request) {
  const { response, user } = await updateSession(request);
  const hostname = request.headers.get('host') ?? '';
  const pathname = request.nextUrl.pathname;
  const slug = resolveSubdomain(hostname);

  if (slug && !pathname.startsWith('/events/')) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/events/${slug}`;
    const rewritten = NextResponse.rewrite(rewriteUrl);
    response.cookies.getAll().forEach((cookie) => {
      rewritten.cookies.set(cookie);
    });
    return rewritten;
  }

  if (pathname.startsWith('/dashboard') && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth';
    const redirected = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirected.cookies.set(cookie);
    });
    return redirected;
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
