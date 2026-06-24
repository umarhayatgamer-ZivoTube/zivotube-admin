import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // For a production app with Firebase Auth, you would typically use
  // Firebase Admin SDK to verify a session cookie.
  // This is a placeholder for the logic.

  const { pathname } = request.nextUrl

  // Public paths
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // Check for admin session (simplified)
  // const session = request.cookies.get('admin-session')
  // if (!session) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return NextResponse.next()
}

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
}
