import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login'];
const publicApiPaths = ['/api/auth/session', '/api/auth/signout'];

function isPublicPath(pathname: string) {
  return publicPaths.includes(pathname) || publicApiPaths.some((path) => pathname.startsWith(path));
}

function createSupabaseVerifier() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('sb-access-token')?.value;

  if (isPublicPath(pathname)) {
    if (pathname === '/login' && token) {
      const { data } = await createSupabaseVerifier().auth.getUser(token);
      if (data.user) return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data, error } = await createSupabaseVerifier().auth.getUser(token);
  if (error || !data.user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', data.user.id);
  requestHeaders.set('x-user-email', data.user.email ?? '');

  return NextResponse.next({ request: { headers: requestHeaders } });
}
