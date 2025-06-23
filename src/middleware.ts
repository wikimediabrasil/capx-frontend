import { NextResponse, NextRequest } from 'next/server';

/**
 * Middleware function to handle request headers
 * Adds custom headers with URL information to the request
 * @param request - The incoming request object
 * @returns NextResponse with modified headers
 */

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const { origin, pathname } = url;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);
  requestHeaders.set('x-origin', origin);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Configure which paths should be processed by this middleware
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
