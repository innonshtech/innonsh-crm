# Backup & Disaster Recovery (DR) Plan

This document outlines the backup strategies and disaster recovery procedures for the Innonsh CRM Suite to ensure business continuity and data integrity.

## 1. Data Backup Strategy

### 1.1 Supabase (Primary Database)
- **Automated Backups:** Supabase automatically performs daily logical backups via pg_dump. These are retained for 7 days on the Free/Pro tiers, and 30 days on Enterprise.
- **Point-in-Time Recovery (PITR):** If on the Pro plan or higher, PITR allows rolling back to any specific second within the retention window.
- **Manual Backups:** 
  - Administrators must perform manual logical backups (`pg_dump`) before major migrations or application upgrades.
  - Command: `pg_dump -h db.[PROJECT-REF].supabase.co -U postgres -d postgres > backup_$(date +%F).sql`

### 1.2 MongoDB (Fallback Database)
- **MongoDB Atlas:** If using MongoDB Atlas, automated daily snapshots are enabled.
- **Retention:** Snapshots are retained for a minimum of 7 days.
- **Manual Export:** Regular JSON/BSON exports of the `users` and `emails` collections are recommended via `mongoexport`.

## 2. Infrastructure Backup

### 2.1 Codebase & Configuration
- **GitHub:** The codebase is hosted on GitHub. `main` branch is protected and requires PR reviews.
- **Environment Variables:** Secrets are securely stored in Vercel Environment Variables. A local encrypted backup of the `.env` template should be kept securely in a password manager (e.g., 1Password or Bitwarden) accessible only to core Administrators.

## 3. Disaster Recovery Procedures

### 3.1 Database Compromise / Data Loss
**Scenario:** Malicious actor drops tables or data corruption occurs.
1. **Assess:** Identify the exact time of the breach or corruption.
2. **Isolate:** Disable application access by taking the Vercel deployment offline or setting a maintenance page.
3. **Restore:** 
   - Use Supabase PITR to restore the database to the point immediately preceding the event.
   - If PITR is unavailable, restore from the last daily `pg_dump` snapshot via the Supabase Dashboard.
4. **Audit:** Review `src/lib/logger.js` audit logs and Supabase Auth logs to identify the vector of compromise.
5. **Recover:** Rotate all `JWT_SECRET`, database passwords, and API keys. Redeploy the application.

### 3.2 Vercel Outage
**Scenario:** Vercel experiences a regional or global outage preventing CRM access.
1. **Fallback:** Deploy the Next.js application to a secondary provider (e.g., AWS Amplify, Render, or an EC2 instance via Docker) using the GitHub repository.
2. **DNS Shift:** Update the domain DNS records (Cloudflare/Route53) to point to the secondary provider's load balancer.

## 4. Testing the Plan
- **Frequency:** The DR plan must be tested quarterly.
- **Process:** A staging environment should be spun up using a restored database backup to verify data integrity and Recovery Time Objective (RTO) targets.
