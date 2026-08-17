import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_COOKIE_NAME = 'auth_token';

// Helper to decode JWT payload safely in edge middleware
function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
  const user = token ? decodeJwtPayload(token) : null;

  // Protect Admin Routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!user || user.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
  }

  // Protect Restaurant Staff Routes
  if (pathname.startsWith('/restaurant') || pathname.startsWith('/api/restaurant')) {
    if (!user || (user.role !== 'RESTAURANT_STAFF' && user.role !== 'ADMIN')) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Restaurant staff access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
  }

  // Protect Delivery Partner Routes
  if (pathname.startsWith('/delivery') || pathname.startsWith('/api/delivery')) {
    if (!user || (user.role !== 'DELIVERY_PARTNER' && user.role !== 'ADMIN')) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Delivery partner access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
  }

  // Protect Checkout & Orders
  if (pathname === '/checkout' || pathname === '/orders') {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/restaurant/:path*',
    '/api/restaurant/:path*',
    '/delivery/:path*',
    '/api/delivery/:path*',
    '/checkout',
    '/orders',
  ],
};
