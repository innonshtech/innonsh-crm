import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Define public routes that don't require authentication
const publicRoutes = ['/api/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/auth/register', '/api/auth/seed'];

// Simple edge-compatible rate limiter (using a Map)
// Note: In Serverless/Edge, this state is isolated per instance.
const rateLimitMap = new Map();

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // We only want to protect API routes for now
  if (pathname.startsWith('/api/')) {
    
    // --- Rate Limiting ---
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = pathname.startsWith('/api/auth/') ? 5 : 60; // Stricter for Auth

    const tokenData = rateLimitMap.get(ip) || { count: 0, startTime: now };

    // Reset window
    if (now - tokenData.startTime > windowMs) {
      tokenData.count = 0;
      tokenData.startTime = now;
    }

    tokenData.count += 1;
    rateLimitMap.set(ip, tokenData);

    if (tokenData.count > maxRequests) {
      return NextResponse.json({ error: 'Too many requests, please try again later.' }, { status: 429 });
    }
    // ---------------------

    // Exclude public API routes
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. No active session found.' }, { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_crm_jwt_secret_token');
      const { payload } = await jwtVerify(token, secret);

      // Example of central RBAC: if route is /api/admin/*, only owner/admin can access
      if (pathname.startsWith('/api/admin/')) {
        if (payload.role !== 'owner' && payload.role !== 'sales_admin') {
          return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }
      }

      // Add decoded user to headers so API routes can access it without re-verifying
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', payload.id);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Middleware JWT verification failed:', error.message);
      return NextResponse.json({ error: 'Unauthorized. Invalid or expired token.' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
