import { LRUCache } from 'lru-cache';

// Simple in-memory rate limiter for Edge / Serverless environments.
// Note: In Vercel serverless, memory is isolated per lambda instance, so this isn't a strict global limit.
// For true global rate limiting, Redis (Upstash) is recommended.

const tokenCache = new LRUCache({
  max: 500,
  ttl: 60 * 1000, // 1 minute
});

export async function rateLimit(request, limit = 5, windowMs = 60000) {
  // Use IP address as the identifier
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  
  const tokenCount = tokenCache.get(ip) || [0];
  
  if (tokenCount[0] === 0) {
    tokenCache.set(ip, tokenCount);
  }

  tokenCount[0] += 1;

  return {
    success: tokenCount[0] <= limit,
    limit,
    remaining: Math.max(0, limit - tokenCount[0]),
  };
}
