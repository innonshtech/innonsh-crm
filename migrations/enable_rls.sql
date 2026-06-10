-- ============================================================
-- INNONSH CRM - Row Level Security (RLS) Migration
-- Run this in your Supabase SQL Editor to enable RLS on all
-- application tables. The Next.js server uses the service_role
-- key which bypasses RLS, so all API routes will continue to
-- work. Direct anonymous access from the browser will be denied.
-- ============================================================

-- ---- Core Auth & Organization Tables ----

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ---- CRM Module Tables ----

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_organizations ENABLE ROW LEVEL SECURITY;

-- ---- Settings & Tenant Tables ----

ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_integrations ENABLE ROW LEVEL SECURITY;

-- ---- Support & Tickets ----

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- ---- Real Estate Tables ----

ALTER TABLE public.real_estate_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_possessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_blocked_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_lead_attachments ENABLE ROW LEVEL SECURITY;

-- ---- Healthcare Tables ----

ALTER TABLE public.healthcare_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_pharmacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_claims ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DENY-ALL DEFAULT POLICIES (Explicit Block for Anon Key)
-- These policies ensure that NO anonymous (browser-direct) reads
-- or writes can pass through. The server-side service_role key
-- bypasses all these policies automatically.
-- ============================================================

-- Deny all access via anon key on core tables
CREATE POLICY "Deny anon access" ON public.users AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.organizations AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.active_sessions AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.audit_logs AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.leads AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.lead_notes AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.lead_attachments AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.contacts AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.deals AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.tasks AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.calls AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.meetings AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.emails AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.notifications AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.products AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.quotations AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.invoices AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.client_organizations AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.custom_field_definitions AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.module_requests AS RESTRICTIVE FOR ALL TO anon USING (false);
CREATE POLICY "Deny anon access" ON public.meta_integrations AS RESTRICTIVE FOR ALL TO anon USING (false);

-- ============================================================
-- HOW TO RUN THIS MIGRATION:
-- 1. Open your Supabase project dashboard.
-- 2. Go to SQL Editor.
-- 3. Paste the contents of this file.
-- 4. Click "Run".
-- 5. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file
--    (get it from Project Settings -> API -> service_role key).
-- ============================================================
