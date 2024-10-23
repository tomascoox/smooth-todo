import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isAppPage = request.nextUrl.pathname.startsWith('/app');
  const isAcceptInvitePage = request.nextUrl.pathname.startsWith('/workgroups/accept-invite');

  // Allow access to accept-invite page without authentication
  if (isAcceptInvitePage) {
    return null;
  }

  if (isAuthPage) {
    if (isAuth) {
      const redirect = new URL(request.nextUrl.searchParams.get('redirect') || '/app', request.url);
      return NextResponse.redirect(redirect);
    }
    return null;
  }

  if (isAppPage) {
    if (!isAuth) {
      const callbackUrl = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(new URL(`/login?redirect=${callbackUrl}`, request.url));
    }
    return null;
  }

  return null;
}

export const config = {
  matcher: ['/app/:path*', '/login', '/register', '/workgroups/accept-invite'],
};
