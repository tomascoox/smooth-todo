import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isAppPage = request.nextUrl.pathname.startsWith('/app');
  const isAcceptInvitePage = request.nextUrl.pathname.startsWith('/workgroups/accept-invite');

  // Remove the force redirect for accept-invite page
  // Let the page handle the auth flow with its own UI

  if (isAuthPage) {
    if (isAuth) {
      // Check if there's a redirect parameter
      const redirectUrl = request.nextUrl.searchParams.get('redirect');
      if (redirectUrl) {
        // Decode the URL before redirecting
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
  matcher: ['/app/:path*', '/login', '/register', '/workgroups/accept-invite'],
};
