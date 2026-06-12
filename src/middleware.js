import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Define public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login', 
  '/api/auth/forgot-password', 
  '/api/auth/reset-password', 
  '/api/auth/register', 
  '/api/auth/seed',
  '/api/leads/website'
];

// Simple edge-compatible rate limiter (using a Map)
// Note: In Serverless/Edge, this state is isolated per instance.
const rateLimitMap = new Map();

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const origin = req.headers.get('origin');
  const isApi = pathname.startsWith('/api/');
  const isWebhook = pathname.startsWith('/api/webhooks/');
  const allowedOrigins = [];
  if (process.env.APP_URL) {
    allowedOrigins.push(process.env.APP_URL.trim().replace(/\/$/, ''));
  }
  allowedOrigins.push('http://localhost:3000', 'http://localhost:5000');
  if (req.nextUrl?.origin) {
    allowedOrigins.push(req.nextUrl.origin.trim().replace(/\/$/, ''));
  }

  // Handle CORS preflight OPTIONS request
  if (isApi && req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    if (origin && (allowedOrigins.includes(origin) || isWebhook)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with');
    }
    return response;
  }

  // Handle CORS blocked origin checks for actual requests
  if (isApi && origin && !isWebhook && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'CORS Blocked: Access Denied' }, { status: 403 });
  }

  // Define actual middleware flow logic
  const response = await handleMiddlewareLogic(req);

  // Append CORS headers on successful/error api responses
  if (isApi && origin && (allowedOrigins.includes(origin) || isWebhook)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

async function handleMiddlewareLogic(req) {
  const { pathname } = req.nextUrl;

  // We only want to protect API routes for now
  if (pathname.startsWith('/api/')) {
    
    // Clean any client-sent x-user- headers to prevent spoofing
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete('x-user-id');
    requestHeaders.delete('x-user-role');
    requestHeaders.delete('x-user-email');
    requestHeaders.delete('x-user-org-id');
    requestHeaders.delete('x-user-is-super-admin');
    requestHeaders.delete('x-user-enabled-modules');

    // --- Rate Limiting ---
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const isDev = process.env.NODE_ENV === 'development' || 
                  process.env.NODE_ENV === undefined || 
                  process.env.NODE_ENV !== 'production';
                  
    const host = req.headers.get('host') || '';
    const isLocalhost = ip === '127.0.0.1' || 
                        ip === '::1' || 
                        host.includes('localhost') || 
                        host.includes('127.0.0.1') || 
                        host.includes('[::1]');
    
    // Only apply strict limit (5 req/min) to authentication-critical public routes (login, register, forgot/reset password).
    // Do NOT strictly rate limit session status checks (/api/auth/me) or logouts (/api/auth/logout).
    const isStrictAuthRoute = pathname.startsWith('/api/auth/') && 
                              pathname !== '/api/auth/me' && 
                              pathname !== '/api/auth/logout';
                              
    const maxRequests = (isDev || isLocalhost) ? 1000 : (isStrictAuthRoute ? 20 : 60);

    const tokenData = rateLimitMap.get(ip) || { count: 0, startTime: now };

    // Reset window
    if (now - tokenData.startTime > windowMs) {
      tokenData.count = 0;
      tokenData.startTime = now;
    }

    tokenData.count += 1;
    rateLimitMap.set(ip, tokenData);

    if (tokenData.count > maxRequests) {
      console.warn(`[Rate Limiter] Blocked IP ${ip} requesting ${pathname} (Count: ${tokenData.count}, Max Allowed: ${maxRequests})`);
      return NextResponse.json({ error: 'Too many requests, please try again later.' }, { status: 429 });
    }
    // ---------------------

    // Exclude public API routes and webhook endpoints
    if (publicRoutes.includes(pathname) || pathname.startsWith('/api/webhooks/')) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. No active session found.' }, { status: 401 });
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('FATAL: JWT_SECRET environment variable is missing!');
      }
      const secret = new TextEncoder().encode(jwtSecret);
      const { payload } = await jwtVerify(token, secret);

      // Example of central RBAC: if route is /api/admin/*, only owner/admin can access
      if (pathname.startsWith('/api/admin/')) {
        if (payload.role !== 'owner' && payload.role !== 'sales_admin') {
          return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }
      }

      // Add decoded user details to headers so API routes can access them without re-verifying
      requestHeaders.set('x-user-id', payload.id || '');
      requestHeaders.set('x-user-role', payload.role || '');
      requestHeaders.set('x-user-email', payload.email || '');
      requestHeaders.set('x-user-org-id', payload.orgId || '');
      requestHeaders.set('x-user-is-super-admin', payload.isSuperAdmin ? 'true' : 'false');
      requestHeaders.set('x-user-enabled-modules', Array.isArray(payload.enabledModules) ? payload.enabledModules.join(',') : '');

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
