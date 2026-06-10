# Innonsh CRM - Security Gaps & Implementation Solutions Report

This document outlines the security issues and gaps identified in the current Innonsh CRM codebase compared to enterprise-grade security standards, along with concrete steps to resolve each issue.

---

## 🛠️ Category 1: Environment & Secret Management

### 1. Hardcoded Fallback JWT Secrets (Critical Risk)
* **What is missing?**
  The codebase uses a hardcoded fallback string `'fallback_crm_jwt_secret_token'` if the `JWT_SECRET` environment variable is not defined or fails to load.
* **Risk:**
  If the `JWT_SECRET` is missing in production, the application will silently fall back to this weak, guessable string. An attacker could use this hardcoded key to generate valid JWT tokens and log in as any user, including a superadmin.
* **Locations:**
  * [src/lib/auth.js (Line 4)](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/lib/auth.js#L4)
  * [src/middleware.js (Line 52)](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/middleware.js#L52)
  * [src/app/api/auth/refresh/route.js (Line 17)](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/app/api/auth/refresh/route.js#L17)
* **Solution:**
  Remove the fallback values and enforce an immediate server shutdown (Fail-Safe) if the environment variable is not set.
  ```javascript
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET environment variable is missing!");
  }
  ```

### 2. Environment Variables Validation is Inactive (Medium Risk)
* **What is missing?**
  A Zod schema validation exists in [src/lib/env.js](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/lib/env.js) to enforce environment parameter integrity. However, this file is **never imported** anywhere in the project codebase.
* **Risk:**
  Invalid, weak (less than 32 characters for JWT), or missing configurations will not trigger a build-time or startup failure, leading to potential configuration issues or silent vulnerabilities in production.
* **Solution:**
  Import the environment validator file at the entry point of the server lifecycle (e.g., in layout pages or root APIs) to ensure validations run during initialization:
  ```javascript
  import '@/lib/env'; // Triggers environment schema check on startup
  ```

---

## 🛡️ Category 2: Authentication & Session Security

### 3. Missing Refresh Token Rotation (RTR) (Medium Risk)
* **What is missing?**
  While refresh tokens are used in [src/app/api/auth/refresh/route.js](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/app/api/auth/refresh/route.js), they are not rotated upon consumption, and there is no tracking to invalidate sessions if a token is reused.
* **Risk:**
  If an attacker steals a user's refresh token, they can repeatedly request new access tokens indefinitely without the victim's knowledge, bypass standard session limits, and avoid detection.
* **Solution:**
  1. Whenever a token refresh occurs, mark the old refresh token as revoked (`is_revoked = true` in the DB).
  2. Issue a new refresh token and set it in the cookies.
  3. Implement reuse detection: If a client attempts to refresh using an already revoked token, immediately terminate all active sessions for that user to prevent unauthorized access.

### 4. Lack of Active Session Management for Users (Low/Medium Risk)
* **What is missing?**
  The `active_sessions` database table logs details like IP, User-Agent, and timestamps. However, there are no API routes or user interfaces for users to view or revoke these active sessions.
* **Risk:**
  Users cannot audit their logged-in devices and are unable to force a logout on other devices if their credentials are compromised.
* **Solution:**
  * Build a GET endpoint `/api/settings/sessions` to fetch all active devices for the user.
  * Build a POST endpoint `/api/settings/sessions/revoke` to delete specific session IDs.
  * Add a dashboard settings interface for managing active sessions.

---

## ⚡ Category 3: API Security & Request Control

### 5. Ineffective Rate Limiting in Scaled/Serverless Environments (High Risk)
* **What is missing?**
  In [src/middleware.js](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/middleware.js), rate limiting relies on an in-memory JavaScript `Map` object: `const rateLimitMap = new Map()`.
* **Risk:**
  In serverless (like Vercel) or containerized multi-instance deployments, memory is isolated per server instance and reset during cold starts. Attackers can distribute brute-force attempts across requests and easily bypass limits.
* **Solution:**
  Replace the memory-based Map with a centralized Redis storage mechanism (e.g., `@upstash/redis` Rest SDK):
  ```javascript
  import { Redis } from '@upstash/redis';
  const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
  ```

### 6. Missing CORS Configuration (High Risk)
* **What is missing?**
  API routes do not enforce any Cross-Origin Resource Sharing (CORS) rules.
* **Risk:**
  Browsers from arbitrary domains can trigger requests to CRM API endpoints, potentially exploiting active session cookies to execute unauthorized actions.
* **Solution:**
  Configure a strict origin check in [src/middleware.js](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/middleware.js):
  ```javascript
  const allowedOrigins = [process.env.APP_URL];
  const origin = req.headers.get('origin');
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'CORS Blocked: Access Denied' }, { status: 403 });
  }
  ```

### 7. Missing Content-Security-Policy (CSP) & Security Headers (Medium Risk)
* **What is missing?**
  [next.config.js](file:///c:/Users/Dell/Desktop/Innonsh/CRM/next.config.js) does not define dynamic HTTP response headers like Content-Security-Policy (CSP), `X-Frame-Options`, or `X-Content-Type-Options`.
* **Risk:**
  The web app is vulnerable to Cross-Site Scripting (XSS), Clickjacking (framing), and MIME sniffing attacks.
* **Solution:**
  Configure secure HTTP headers inside `next.config.js`:
  ```javascript
  const securityHeaders = [
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" }
  ];
  ```

### 8. No Zod Schema Validation in API Payloads (Medium Risk)
* **What is missing?**
  Auth endpoints (such as `/api/auth/login`) and users directory APIs validate JSON parameters manually instead of using structured validation schemas like Zod.
* **Risk:**
  Unexpected payload structures, SQL/NoSQL injection parameters, or empty/malformed inputs can bypass simple validation checks and trigger internal database schema errors or crashes.
* **Solution:**
  Define and execute Zod parser checks on all incoming request bodies inside API route endpoints:
  ```javascript
  // Example: loginSchema.parse(await req.json());
  ```

### 9. Inactive Input Sanitization (Low/Medium Risk)
* **What is missing?**
  Although [src/lib/sanitize.js](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/lib/sanitize.js) provides a `sanitizePayload` function to remove dangerous HTML attributes, it is **never imported or called** in any API endpoint.
* **Risk:**
  Attackers can save raw script tags in form fields (like Leads description or notes), resulting in Stored Cross-Site Scripting (XSS) when other users load the dashboard.
* **Solution:**
  Apply `sanitizePayload` to all incoming body requests in POST and PUT API routes.

---

## 📂 Category 4: File Upload Security

### 10. Direct Base64 Database Storage & Missing MIME Type Verification (Critical Risk)
* **What is missing?**
  The route [src/app/api/leads/[id]/attachments/route.js](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/app/api/leads/%5Bid%5D/attachments/route.js) receives files as Base64 strings and inserts them directly into the SQL/NoSQL database. There are no checks to verify if the file contents match the declared file type.
* **Risk:**
  1. **Database Bloating:** Storing multiple megabytes of Base64 strings directly in database tables degrades query performance and increases database size rapidly.
  2. **Remote Code Execution (RCE):** A malicious actor could upload executable scripts (like `.exe`, `.html`, `.js`, `.sh`) and trick a user or system into executing them.
* **Solution:**
  * Migrate file uploads to a cloud bucket (e.g., Supabase Storage or AWS S3) and save only the storage URL reference in the database.
  * Integrate binary file checks (using magic bytes verification like `file-type`) and reject execution extensions.

---

## 🗄️ Category 5: Database Security

### 11. Missing Row Level Security (RLS) Policies (Medium Risk)
* **What is missing?**
  The Postgres setup SQL file [client_db_setup.sql](file:///c:/Users/Dell/Desktop/Innonsh/CRM/client_db_setup.sql) sets up relational tables but does not enable Row Level Security (RLS) policies.
* **Risk:**
  If API client keys are extracted from browser configurations, an anonymous client can bypass middlewares and directly query the database tables, leaking multi-tenant records across organizations.
* **Solution:**
  Enable RLS on Postgres tables and implement tenant isolation policies:
  ```sql
  ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Org Lead access restriction" ON public.leads FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
  ```

---

## 📊 Category 6: Logging & Monitoring

### 12. Structured Auditing is Limited to Login Actions (Low/Medium Risk)
* **What is missing?**
  The Winston logging utility in [src/lib/logger.js](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/lib/logger.js) is only called during authorization actions (success/fail logins). No audit logs are written for core database CRUD actions.
* **Risk:**
  In the event of a security breach or data loss, it is impossible to determine who deleted leads, changed user roles, or exported contact databases.
* **Solution:**
  Inject `auditLog()` calls into critical state-modifying endpoints (like lead deletion, role assignments, and batch exports).

---

## 📅 Implementation & Fix Priority Roadmap

1. **Phase 1 (Immediate / High Priority):**
   * Remove hardcoded JWT fallback secrets in [src/lib/auth.js](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/lib/auth.js) and [src/middleware.js](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/middleware.js).
   * Activate startup configuration verification by importing [src/lib/env.js](file:///c:/Users/Dell/Desktop/Innonsh/CRM/src/lib/env.js).
   * Establish MIME checking and migrate Base64 uploads to cloud buckets.
2. **Phase 2 (Medium Priority):**
   * Configure CORS and HSTS/CSP response headers in [next.config.js](file:///c:/Users/Dell/Desktop/Innonsh/CRM/next.config.js).
   * Implement Refresh Token Rotation (RTR).
   * Enable Row Level Security (RLS) on Postgres tables.
3. **Phase 3 (Low Priority):**
   * Integrate Winston audit logs for critical database operations.
   * Add dynamic Zod validation schemas for all POST/PUT routes.
