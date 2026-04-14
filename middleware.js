import { NextResponse } from 'next/server';

// Define protected routes
const protectedRoutes = ['/game', '/game/onedicegame', '/game/twodicegame', '/profile', '/deposit', '/withdrawal', '/leaderboard', '/ledger', '/transactions'];
const adminRoutes = ['/admin'];
const publicRoutes = ['/login', '/register', '/'];

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  const isAdminLogin = pathname === '/admin';

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If it's a protected route, check for token
  if (isProtectedRoute) {
    const token = request.cookies.get('authToken')?.value;

    // No token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Token exists, allow access
    // Full JWT verification happens in API endpoints
    return NextResponse.next();
  }

  // Admin routes (except login) require admin cookie
  if (isAdminRoute && !isAdminLogin) {
    const adminToken = request.cookies.get('adminAuth')?.value;

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
