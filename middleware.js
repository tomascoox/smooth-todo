import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isAppPage = request.nextUrl.pathname.startsWith('/app');

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/app', request.url));
    }
    return null;
  }

  if (isAppPage) {
    if (!isAuth) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return null;
  }

  return null;
}

export const config = {
  matcher: ['/app/:path*', '/login', '/register'],
};
