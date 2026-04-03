import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL('/auth', origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorUrl = new URL('/auth', origin);
    errorUrl.searchParams.set('error', 'callback_failed');
    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(new URL(next, origin));
}
