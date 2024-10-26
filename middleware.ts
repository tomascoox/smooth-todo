import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isAppPage = request.nextUrl.pathname.startsWith('/app');

  if (isAuthPage) {
    if (isAuth) {
      const redirectUrl = request.nextUrl.searchParams.get('redirect');
      if (redirectUrl) {
        return NextResponse.redirect(new URL(decodeURIComponent(redirectUrl), request.url));
      }
      return NextResponse.redirect(new URL('/app', request.url));
    }
    return null;
  }

  if (isAppPage && !isAuth) {
    const callbackUrl = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(new URL(`/login?redirect=${callbackUrl}`, request.url));
  }

  return null;
}

export const config = {
  matcher: ['/app/:path*', '/login', '/register'],  // Removed /workgroups/accept-invite
};
