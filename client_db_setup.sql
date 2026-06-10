-- =====================================================
-- INNONSH CRM SUITE DATABASE SCHEMA INITIALIZATION
-- Generated dynamically on 2026-06-09T09:34:50.306Z
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: active_sessions
CREATE TABLE IF NOT EXISTS public.active_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    refresh_token TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT active_sessions_pkey PRIMARY KEY (id)
);

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID,
    org_id UUID,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);

-- Table: calls
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    call_type TEXT NOT NULL DEFAULT 'Outbound'::text,
    call_duration INTEGER DEFAULT 0,
    call_result TEXT NOT NULL DEFAULT 'Answered'::text,
    call_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    notes TEXT DEFAULT ''::text,
    assigned_to UUID,
    lead_id UUID,
    contact_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    org_id UUID,
    CONSTRAINT calls_pkey PRIMARY KEY (id)
);

-- Table: client_organizations
CREATE TABLE IF NOT EXISTS public.client_organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255) DEFAULT ''::character varying,
    industry VARCHAR(100) DEFAULT ''::character varying,
    phone VARCHAR(50) DEFAULT ''::character varying,
    email VARCHAR(255) DEFAULT ''::character varying,
    city VARCHAR(100) DEFAULT ''::character varying,
    state VARCHAR(100) DEFAULT ''::character varying,
    country VARCHAR(100) DEFAULT 'India'::character varying,
    assigned_to UUID,
    custom_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT client_organizations_pkey PRIMARY KEY (id)
);

-- Table: contacts
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT DEFAULT ''::text,
    company TEXT DEFAULT ''::text,
    designation TEXT DEFAULT ''::text,
    email TEXT DEFAULT ''::text,
    phone TEXT DEFAULT ''::text,
    whatsapp TEXT DEFAULT ''::text,
    city TEXT DEFAULT ''::text,
    state TEXT DEFAULT ''::text,
    country TEXT DEFAULT 'India'::text,
    assigned_to UUID,
    lead_id UUID,
    status TEXT NOT NULL DEFAULT 'Active'::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    org_id UUID,
    custom_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    organization_id UUID,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    follow_up_type VARCHAR(50),
    CONSTRAINT contacts_pkey PRIMARY KEY (id)
);

-- Table: custom_field_definitions
CREATE TABLE IF NOT EXISTS public.custom_field_definitions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    module TEXT NOT NULL DEFAULT 'leads'::text,
    field_key TEXT NOT NULL,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL DEFAULT 'text'::text,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_required BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    placeholder TEXT DEFAULT ''::text,
    icon_name TEXT,
    CONSTRAINT custom_field_definitions_pkey PRIMARY KEY (id)
);

-- Table: deals
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    value NUMERIC NOT NULL,
    stage TEXT NOT NULL DEFAULT 'Prospecting'::text,
    closing_date TIMESTAMP WITH TIME ZONE NOT NULL,
    lead_id UUID,
    assigned_to UUID,
    company TEXT NOT NULL,
    contact_email TEXT DEFAULT ''::text,
    contact_phone TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    org_id UUID,
    custom_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    organization_id UUID,
    CONSTRAINT deals_pkey PRIMARY KEY (id)
);

-- Table: emails
CREATE TABLE IF NOT EXISTS public.emails (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    lead_id UUID,
    contact_id UUID,
    sent_by UUID,
    opens_count INTEGER DEFAULT 0,
    opened_at JSONB DEFAULT '[]'::jsonb,
    downloads_count INTEGER DEFAULT 0,
    downloaded_at JSONB DEFAULT '[]'::jsonb,
    replied BOOLEAN DEFAULT false,
    replied_at TIMESTAMP WITH TIME ZONE,
    reply_body TEXT DEFAULT ''::text,
    proposal_file TEXT DEFAULT ''::text,
    proposal_file_data TEXT DEFAULT ''::text,
    proposal_file_mime_type TEXT DEFAULT ''::text,
    channel TEXT NOT NULL DEFAULT 'email'::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    org_id UUID,
    cc TEXT DEFAULT ''::text,
    CONSTRAINT emails_pkey PRIMARY KEY (id)
);

-- Table: healthcare_admissions
CREATE TABLE IF NOT EXISTS public.healthcare_admissions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    patient_id UUID,
    admission_date TIMESTAMP WITH TIME ZONE NOT NULL,
    discharge_date TIMESTAMP WITH TIME ZONE,
    ward_number TEXT DEFAULT ''::text,
    bed_number TEXT DEFAULT ''::text,
    status TEXT NOT NULL DEFAULT 'Admitted'::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT healthcare_admissions_pkey PRIMARY KEY (id)
);

-- Table: healthcare_appointments
CREATE TABLE IF NOT EXISTS public.healthcare_appointments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    patient_id UUID,
    doctor_id UUID,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled'::text,
    notes TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT healthcare_appointments_pkey PRIMARY KEY (id)
);

-- Table: healthcare_billing
CREATE TABLE IF NOT EXISTS public.healthcare_billing (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    patient_id UUID,
    amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Unpaid'::text,
    payment_method TEXT DEFAULT 'Cash'::text,
    billing_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    line_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT healthcare_billing_pkey PRIMARY KEY (id)
);

-- Table: healthcare_claims
CREATE TABLE IF NOT EXISTS public.healthcare_claims (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    patient_id UUID,
    policy_number TEXT NOT NULL,
    claim_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Submitted'::text,
    submitted_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT healthcare_claims_pkey PRIMARY KEY (id)
);

-- Table: healthcare_doctors
CREATE TABLE IF NOT EXISTS public.healthcare_doctors (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    name TEXT NOT NULL,
    specialization TEXT DEFAULT ''::text,
    phone TEXT DEFAULT ''::text,
    email TEXT DEFAULT ''::text,
    available_hours TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT healthcare_doctors_pkey PRIMARY KEY (id)
);

-- Table: healthcare_lab_tests
CREATE TABLE IF NOT EXISTS public.healthcare_lab_tests (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    patient_id UUID,
    test_name TEXT NOT NULL,
    test_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending'::text,
    result TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT healthcare_lab_tests_pkey PRIMARY KEY (id)
);

-- Table: healthcare_leads
CREATE TABLE IF NOT EXISTS public.healthcare_leads (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    patient_name TEXT NOT NULL,
    phone TEXT DEFAULT ''::text,
    email TEXT DEFAULT ''::text,
    symptoms TEXT DEFAULT ''::text,
    department TEXT DEFAULT ''::text,
    priority TEXT DEFAULT 'Warm'::text,
    status TEXT NOT NULL DEFAULT 'New'::text,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT healthcare_leads_pkey PRIMARY KEY (id)
);

-- Table: healthcare_medical_records
CREATE TABLE IF NOT EXISTS public.healthcare_medical_records (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    patient_id UUID,
    diagnosis TEXT NOT NULL,
    treatment TEXT DEFAULT ''::text,
    notes TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT healthcare_medical_records_pkey PRIMARY KEY (id)
);

-- Table: healthcare_patients
CREATE TABLE IF NOT EXISTS public.healthcare_patients (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT DEFAULT 'Other'::text,
    phone TEXT DEFAULT ''::text,
    email TEXT DEFAULT ''::text,
    address TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT healthcare_patients_pkey PRIMARY KEY (id)
);

-- Table: healthcare_pharmacy
CREATE TABLE IF NOT EXISTS public.healthcare_pharmacy (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    prescription_id UUID,
    medicine_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending'::text,
    issued_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT healthcare_pharmacy_pkey PRIMARY KEY (id)
);

-- Table: healthcare_prescriptions
CREATE TABLE IF NOT EXISTS public.healthcare_prescriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    patient_id UUID,
    doctor_id UUID,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT healthcare_prescriptions_pkey PRIMARY KEY (id)
);

-- Table: invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,
    title TEXT NOT NULL,
    quotation_id UUID,
    contact_id UUID,
    lead_id UUID,
    deal_id UUID,
    invoice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    line_items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax_rate NUMERIC NOT NULL DEFAULT 18,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    grand_total NUMERIC NOT NULL DEFAULT 0,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    balance_due NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Unpaid'::text,
    payments JSONB DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT ''::text,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    org_id UUID,
    CONSTRAINT invoices_pkey PRIMARY KEY (id)
);

-- Table: lead_attachments
CREATE TABLE IF NOT EXISTS public.lead_attachments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_data TEXT NOT NULL,
    file_type TEXT DEFAULT ''::text,
    file_size INTEGER DEFAULT 0,
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT lead_attachments_pkey PRIMARY KEY (id)
);

-- Table: lead_notes
CREATE TABLE IF NOT EXISTS public.lead_notes (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,
    text TEXT NOT NULL,
    created_by UUID,
    created_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT lead_notes_pkey PRIMARY KEY (id)
);

-- Table: leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT DEFAULT ''::text,
    company TEXT NOT NULL,
    designation TEXT DEFAULT ''::text,
    email TEXT DEFAULT ''::text,
    phone TEXT DEFAULT ''::text,
    whatsapp TEXT DEFAULT ''::text,
    whatsapp_contacted BOOLEAN DEFAULT false,
    website TEXT DEFAULT ''::text,
    city TEXT DEFAULT ''::text,
    state TEXT DEFAULT ''::text,
    country TEXT DEFAULT 'India'::text,
    industry TEXT DEFAULT ''::text,
    employee_count INTEGER DEFAULT 0,
    annual_revenue NUMERIC DEFAULT 0,
    priority TEXT NOT NULL DEFAULT 'Warm'::text,
    status TEXT NOT NULL DEFAULT 'New'::text,
    lost_reason TEXT DEFAULT ''::text,
    source TEXT NOT NULL DEFAULT 'Website'::text,
    requirements TEXT DEFAULT ''::text,
    interested_product TEXT DEFAULT ''::text,
    follow_up_type TEXT NOT NULL DEFAULT 'None'::text,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID,
    score INTEGER DEFAULT 0,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    org_id UUID,
    custom_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID,
    owner_id UUID,
    assigned_by UUID,
    visibility_scope VARCHAR(50) DEFAULT 'PRIVATE'::character varying,
    CONSTRAINT leads_pkey PRIMARY KEY (id)
);

-- Table: meetings
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location_type TEXT NOT NULL DEFAULT 'Online'::text,
    location_detail TEXT DEFAULT ''::text,
    agenda TEXT DEFAULT ''::text,
    status TEXT NOT NULL DEFAULT 'Scheduled'::text,
    assigned_to UUID,
    lead_id UUID,
    contact_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    org_id UUID,
    CONSTRAINT meetings_pkey PRIMARY KEY (id)
);

-- Table: meta_integrations
CREATE TABLE IF NOT EXISTS public.meta_integrations (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    page_id TEXT NOT NULL,
    page_name TEXT,
    page_access_token TEXT NOT NULL,
    form_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT meta_integrations_pkey PRIMARY KEY (id)
);

-- Table: module_requests
CREATE TABLE IF NOT EXISTS public.module_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    module_name TEXT NOT NULL,
    requested_by UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending'::text,
    notes TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT module_requests_pkey PRIMARY KEY (id)
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL,
    sender_id UUID,
    type TEXT NOT NULL DEFAULT 'System'::text,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT DEFAULT ''::text,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    org_id UUID,
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- Table: organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL DEFAULT 'SOFTWARE_SERVICES'::character varying,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'Approved'::character varying,
    is_active BOOLEAN DEFAULT true,
    custom_terminology JSONB NOT NULL DEFAULT '{}'::jsonb,
    pipelines JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    enabled_modules ARRAY DEFAULT ARRAY['leads'::text, 'deals'::text, 'contacts'::text, 'tasks'::text],
    sector TEXT DEFAULT ''::text,
    hidden_standard_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    gstin VARCHAR(50) DEFAULT ''::character varying,
    CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- Table: products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT DEFAULT 'Software'::text,
    description TEXT DEFAULT ''::text,
    status TEXT NOT NULL DEFAULT 'Active'::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    org_id UUID,
    CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- Table: quotations
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    quote_number TEXT NOT NULL,
    title TEXT NOT NULL,
    contact_id UUID,
    lead_id UUID,
    deal_id UUID,
    quote_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    line_items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax_rate NUMERIC NOT NULL DEFAULT 18,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    grand_total NUMERIC NOT NULL DEFAULT 0,
    notes TEXT DEFAULT ''::text,
    status TEXT NOT NULL DEFAULT 'Draft'::text,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    org_id UUID,
    CONSTRAINT quotations_pkey PRIMARY KEY (id)
);

-- Table: real_estate_blocked_units
CREATE TABLE IF NOT EXISTS public.real_estate_blocked_units (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    lead_id UUID,
    property_id UUID,
    token_amount NUMERIC DEFAULT 0,
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_blocked_units_pkey PRIMARY KEY (id)
);

-- Table: real_estate_bookings
CREATE TABLE IF NOT EXISTS public.real_estate_bookings (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    lead_id UUID,
    unit_id UUID,
    property_id UUID,
    booking_amount NUMERIC DEFAULT 0,
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'Confirmed'::text,
    notes TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_bookings_pkey PRIMARY KEY (id)
);

-- Table: real_estate_contacts
CREATE TABLE IF NOT EXISTS public.real_estate_contacts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT DEFAULT ''::text,
    company TEXT DEFAULT ''::text,
    designation TEXT DEFAULT ''::text,
    email TEXT DEFAULT ''::text,
    phone TEXT DEFAULT ''::text,
    whatsapp TEXT DEFAULT ''::text,
    city TEXT DEFAULT ''::text,
    state TEXT DEFAULT ''::text,
    country TEXT DEFAULT 'India'::text,
    assigned_to UUID,
    lead_id UUID,
    status TEXT NOT NULL DEFAULT 'Active'::text,
    custom_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_contacts_pkey PRIMARY KEY (id)
);

-- Table: real_estate_documents
CREATE TABLE IF NOT EXISTS public.real_estate_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    lead_id UUID,
    property_id UUID,
    document_name TEXT NOT NULL,
    document_type TEXT DEFAULT 'KYC File'::text,
    status TEXT NOT NULL DEFAULT 'Verified'::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_documents_pkey PRIMARY KEY (id)
);

-- Table: real_estate_lead_attachments
CREATE TABLE IF NOT EXISTS public.real_estate_lead_attachments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_data TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_lead_attachments_pkey PRIMARY KEY (id)
);

-- Table: real_estate_lead_notes
CREATE TABLE IF NOT EXISTS public.real_estate_lead_notes (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,
    text TEXT NOT NULL,
    created_by UUID,
    created_by_name TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_lead_notes_pkey PRIMARY KEY (id)
);

-- Table: real_estate_leads
CREATE TABLE IF NOT EXISTS public.real_estate_leads (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT DEFAULT ''::text,
    company TEXT DEFAULT ''::text,
    designation TEXT DEFAULT ''::text,
    email TEXT DEFAULT ''::text,
    phone TEXT DEFAULT ''::text,
    whatsapp TEXT DEFAULT ''::text,
    whatsapp_contacted BOOLEAN DEFAULT false,
    website TEXT DEFAULT ''::text,
    city TEXT DEFAULT ''::text,
    state TEXT DEFAULT ''::text,
    country TEXT DEFAULT 'India'::text,
    industry TEXT DEFAULT ''::text,
    employee_count INTEGER DEFAULT 0,
    annual_revenue NUMERIC DEFAULT 0,
    priority TEXT DEFAULT 'Warm'::text,
    status TEXT NOT NULL DEFAULT 'New'::text,
    lost_reason TEXT DEFAULT ''::text,
    source TEXT DEFAULT 'Website'::text,
    requirements TEXT DEFAULT ''::text,
    interested_product TEXT DEFAULT ''::text,
    follow_up_type TEXT DEFAULT 'None'::text,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID,
    score INTEGER DEFAULT 0,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    custom_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_leads_pkey PRIMARY KEY (id)
);

-- Table: real_estate_partners
CREATE TABLE IF NOT EXISTS public.real_estate_partners (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    partner_name TEXT NOT NULL,
    company TEXT DEFAULT ''::text,
    email TEXT DEFAULT ''::text,
    mobile TEXT DEFAULT ''::text,
    commission_percentage NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active'::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_partners_pkey PRIMARY KEY (id)
);

-- Table: real_estate_payment_plans
CREATE TABLE IF NOT EXISTS public.real_estate_payment_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    lead_id UUID,
    property_id UUID,
    plan_title TEXT NOT NULL,
    total_valuation NUMERIC DEFAULT 0,
    milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_payment_plans_pkey PRIMARY KEY (id)
);

-- Table: real_estate_possessions
CREATE TABLE IF NOT EXISTS public.real_estate_possessions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    booking_id UUID,
    lead_id UUID,
    property_id UUID,
    possession_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled'::text,
    remarks TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_possessions_pkey PRIMARY KEY (id)
);

-- Table: real_estate_projects
CREATE TABLE IF NOT EXISTS public.real_estate_projects (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    project_name TEXT NOT NULL,
    builder_name TEXT DEFAULT ''::text,
    location TEXT DEFAULT ''::text,
    launch_date DATE,
    possession_date DATE,
    status TEXT NOT NULL DEFAULT 'Under Construction'::text,
    total_units INTEGER DEFAULT 0,
    description TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_projects_pkey PRIMARY KEY (id)
);

-- Table: real_estate_properties
CREATE TABLE IF NOT EXISTS public.real_estate_properties (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Apartment'::text,
    location TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    size NUMERIC DEFAULT 0,
    beds INTEGER DEFAULT 0,
    baths INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Available'::text,
    image TEXT DEFAULT ''::text,
    amenities ARRAY DEFAULT '{}'::text[],
    custom_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_properties_pkey PRIMARY KEY (id)
);

-- Table: real_estate_site_visits
CREATE TABLE IF NOT EXISTS public.real_estate_site_visits (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    lead_id UUID,
    property_id UUID,
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled'::text,
    feedback TEXT DEFAULT ''::text,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_site_visits_pkey PRIMARY KEY (id)
);

-- Table: real_estate_units
CREATE TABLE IF NOT EXISTS public.real_estate_units (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    project_id UUID,
    unit_number TEXT NOT NULL,
    tower TEXT DEFAULT ''::text,
    floor TEXT DEFAULT ''::text,
    property_type TEXT DEFAULT 'Apartment'::text,
    area NUMERIC DEFAULT 0,
    price NUMERIC DEFAULT 0,
    facing TEXT DEFAULT ''::text,
    status TEXT NOT NULL DEFAULT 'Available'::text,
    description TEXT DEFAULT ''::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT real_estate_units_pkey PRIMARY KEY (id)
);

-- Table: saas_organizations
CREATE TABLE IF NOT EXISTS public.saas_organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL DEFAULT 'SOFTWARE_SERVICES'::character varying,
    status VARCHAR(50) NOT NULL DEFAULT 'Approved'::character varying,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT saas_organizations_pkey PRIMARY KEY (id)
);

-- Table: saas_users
CREATE TABLE IF NOT EXISTS public.saas_users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'org_admin'::character varying,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT saas_users_pkey PRIMARY KEY (id)
);

-- Table: support_tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    lead_id UUID,
    subject TEXT NOT NULL,
    description TEXT DEFAULT ''::text,
    priority TEXT DEFAULT 'Medium'::text,
    status TEXT NOT NULL DEFAULT 'Open'::text,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT support_tickets_pkey PRIMARY KEY (id)
);

-- Table: tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium'::text,
    status TEXT NOT NULL DEFAULT 'Pending'::text,
    notes TEXT DEFAULT ''::text,
    assigned_to UUID,
    lead_id UUID,
    contact_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    org_id UUID,
    CONSTRAINT tasks_pkey PRIMARY KEY (id)
);

-- Table: teams
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT DEFAULT ''::text,
    leader UUID,
    members JSONB DEFAULT '[]'::jsonb,
    region TEXT DEFAULT 'General'::text,
    target_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    org_id UUID,
    CONSTRAINT teams_pkey PRIMARY KEY (id)
);

-- Table: ticket_comments
CREATE TABLE IF NOT EXISTS public.ticket_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL,
    author_id UUID,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT ticket_comments_pkey PRIMARY KEY (id)
);

-- Table: users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'sales_rep'::text,
    approval_status TEXT NOT NULL DEFAULT 'Approved'::text,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    otp_code TEXT,
    otp_expiry TIMESTAMP WITH TIME ZONE,
    org_id UUID,
    is_super_admin BOOLEAN DEFAULT false,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Constraints for active_sessions
ALTER TABLE public.active_sessions
  ADD CONSTRAINT active_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for audit_logs
ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for calls
ALTER TABLE public.calls
  ADD CONSTRAINT calls_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.calls
  ADD CONSTRAINT calls_contact_id_fkey
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.calls
  ADD CONSTRAINT calls_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.calls
  ADD CONSTRAINT calls_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for client_organizations
ALTER TABLE public.client_organizations
  ADD CONSTRAINT client_organizations_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.client_organizations
  ADD CONSTRAINT client_organizations_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for contacts
ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.contacts
  ADD CONSTRAINT fk_contacts_assigned_to
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.contacts
  ADD CONSTRAINT fk_contacts_lead_id
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.contacts
  ADD CONSTRAINT fk_contacts_org_id
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for custom_field_definitions
ALTER TABLE public.custom_field_definitions
  ADD CONSTRAINT custom_field_definitions_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for deals
ALTER TABLE public.deals
  ADD CONSTRAINT deals_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.deals
  ADD CONSTRAINT deals_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.deals
  ADD CONSTRAINT deals_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.deals
  ADD CONSTRAINT deals_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.client_organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.deals
  ADD CONSTRAINT fk_deals_lead_id
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.deals
  ADD CONSTRAINT fk_deals_org_id
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for emails
ALTER TABLE public.emails
  ADD CONSTRAINT emails_contact_id_fkey
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.emails
  ADD CONSTRAINT emails_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.emails
  ADD CONSTRAINT emails_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.emails
  ADD CONSTRAINT emails_sent_by_fkey
  FOREIGN KEY (sent_by) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for healthcare_admissions
ALTER TABLE public.healthcare_admissions
  ADD CONSTRAINT healthcare_admissions_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.healthcare_admissions
  ADD CONSTRAINT healthcare_admissions_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.healthcare_patients(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for healthcare_appointments
ALTER TABLE public.healthcare_appointments
  ADD CONSTRAINT healthcare_appointments_doctor_id_fkey
  FOREIGN KEY (doctor_id) REFERENCES public.healthcare_doctors(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.healthcare_appointments
  ADD CONSTRAINT healthcare_appointments_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.healthcare_appointments
  ADD CONSTRAINT healthcare_appointments_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.healthcare_patients(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for healthcare_billing
ALTER TABLE public.healthcare_billing
  ADD CONSTRAINT healthcare_billing_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.healthcare_billing
  ADD CONSTRAINT healthcare_billing_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.healthcare_patients(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for healthcare_claims
ALTER TABLE public.healthcare_claims
  ADD CONSTRAINT healthcare_claims_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.healthcare_claims
  ADD CONSTRAINT healthcare_claims_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.healthcare_patients(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for healthcare_doctors
ALTER TABLE public.healthcare_doctors
  ADD CONSTRAINT healthcare_doctors_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for healthcare_lab_tests
ALTER TABLE public.healthcare_lab_tests
  ADD CONSTRAINT healthcare_lab_tests_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.healthcare_lab_tests
  ADD CONSTRAINT healthcare_lab_tests_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.healthcare_patients(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for healthcare_leads
ALTER TABLE public.healthcare_leads
  ADD CONSTRAINT healthcare_leads_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.healthcare_leads
  ADD CONSTRAINT healthcare_leads_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for healthcare_medical_records
ALTER TABLE public.healthcare_medical_records
  ADD CONSTRAINT healthcare_medical_records_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.healthcare_medical_records
  ADD CONSTRAINT healthcare_medical_records_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.healthcare_patients(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for healthcare_patients
ALTER TABLE public.healthcare_patients
  ADD CONSTRAINT healthcare_patients_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for healthcare_pharmacy
ALTER TABLE public.healthcare_pharmacy
  ADD CONSTRAINT healthcare_pharmacy_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.healthcare_pharmacy
  ADD CONSTRAINT healthcare_pharmacy_prescription_id_fkey
  FOREIGN KEY (prescription_id) REFERENCES public.healthcare_prescriptions(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for healthcare_prescriptions
ALTER TABLE public.healthcare_prescriptions
  ADD CONSTRAINT healthcare_prescriptions_doctor_id_fkey
  FOREIGN KEY (doctor_id) REFERENCES public.healthcare_doctors(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.healthcare_prescriptions
  ADD CONSTRAINT healthcare_prescriptions_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.healthcare_prescriptions
  ADD CONSTRAINT healthcare_prescriptions_patient_id_fkey
  FOREIGN KEY (patient_id) REFERENCES public.healthcare_patients(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for invoices
ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_contact_id_fkey
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_deal_id_fkey
  FOREIGN KEY (deal_id) REFERENCES public.deals(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_quotation_id_fkey
  FOREIGN KEY (quotation_id) REFERENCES public.quotations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for lead_attachments
ALTER TABLE public.lead_attachments
  ADD CONSTRAINT lead_attachments_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for lead_notes
ALTER TABLE public.lead_notes
  ADD CONSTRAINT fk_lead_notes_created_by
  FOREIGN KEY (created_by) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.lead_notes
  ADD CONSTRAINT lead_notes_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.lead_notes
  ADD CONSTRAINT lead_notes_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for leads
ALTER TABLE public.leads
  ADD CONSTRAINT fk_leads_assigned_to
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.leads
  ADD CONSTRAINT fk_leads_org_id
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.leads
  ADD CONSTRAINT leads_assigned_by_fkey
  FOREIGN KEY (assigned_by) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.leads
  ADD CONSTRAINT leads_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.leads
  ADD CONSTRAINT leads_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.leads
  ADD CONSTRAINT leads_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.leads
  ADD CONSTRAINT leads_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for meetings
ALTER TABLE public.meetings
  ADD CONSTRAINT meetings_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.meetings
  ADD CONSTRAINT meetings_contact_id_fkey
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.meetings
  ADD CONSTRAINT meetings_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.meetings
  ADD CONSTRAINT meetings_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for meta_integrations
ALTER TABLE public.meta_integrations
  ADD CONSTRAINT meta_integrations_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for module_requests
ALTER TABLE public.module_requests
  ADD CONSTRAINT module_requests_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for notifications
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_recipient_id_fkey
  FOREIGN KEY (recipient_id) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for products
ALTER TABLE public.products
  ADD CONSTRAINT products_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for quotations
ALTER TABLE public.quotations
  ADD CONSTRAINT quotations_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.quotations
  ADD CONSTRAINT quotations_contact_id_fkey
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.quotations
  ADD CONSTRAINT quotations_deal_id_fkey
  FOREIGN KEY (deal_id) REFERENCES public.deals(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.quotations
  ADD CONSTRAINT quotations_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.quotations
  ADD CONSTRAINT quotations_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_blocked_units
ALTER TABLE public.real_estate_blocked_units
  ADD CONSTRAINT real_estate_blocked_units_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.real_estate_leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_blocked_units
  ADD CONSTRAINT real_estate_blocked_units_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_blocked_units
  ADD CONSTRAINT real_estate_blocked_units_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES public.real_estate_properties(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_bookings
ALTER TABLE public.real_estate_bookings
  ADD CONSTRAINT real_estate_bookings_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.real_estate_leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_bookings
  ADD CONSTRAINT real_estate_bookings_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_bookings
  ADD CONSTRAINT real_estate_bookings_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES public.real_estate_properties(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_bookings
  ADD CONSTRAINT real_estate_bookings_unit_id_fkey
  FOREIGN KEY (unit_id) REFERENCES public.real_estate_units(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_contacts
ALTER TABLE public.real_estate_contacts
  ADD CONSTRAINT real_estate_contacts_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_contacts
  ADD CONSTRAINT real_estate_contacts_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.real_estate_leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_contacts
  ADD CONSTRAINT real_estate_contacts_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_documents
ALTER TABLE public.real_estate_documents
  ADD CONSTRAINT real_estate_documents_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.real_estate_leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_documents
  ADD CONSTRAINT real_estate_documents_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_documents
  ADD CONSTRAINT real_estate_documents_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES public.real_estate_properties(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_lead_attachments
ALTER TABLE public.real_estate_lead_attachments
  ADD CONSTRAINT real_estate_lead_attachments_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.real_estate_leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_lead_attachments
  ADD CONSTRAINT real_estate_lead_attachments_uploaded_by_fkey
  FOREIGN KEY (uploaded_by) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_lead_notes
ALTER TABLE public.real_estate_lead_notes
  ADD CONSTRAINT real_estate_lead_notes_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_lead_notes
  ADD CONSTRAINT real_estate_lead_notes_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.real_estate_leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_leads
ALTER TABLE public.real_estate_leads
  ADD CONSTRAINT real_estate_leads_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_leads
  ADD CONSTRAINT real_estate_leads_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_partners
ALTER TABLE public.real_estate_partners
  ADD CONSTRAINT real_estate_partners_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_payment_plans
ALTER TABLE public.real_estate_payment_plans
  ADD CONSTRAINT real_estate_payment_plans_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.real_estate_leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_payment_plans
  ADD CONSTRAINT real_estate_payment_plans_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_payment_plans
  ADD CONSTRAINT real_estate_payment_plans_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES public.real_estate_properties(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_possessions
ALTER TABLE public.real_estate_possessions
  ADD CONSTRAINT real_estate_possessions_booking_id_fkey
  FOREIGN KEY (booking_id) REFERENCES public.real_estate_bookings(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_possessions
  ADD CONSTRAINT real_estate_possessions_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.real_estate_leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_possessions
  ADD CONSTRAINT real_estate_possessions_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_possessions
  ADD CONSTRAINT real_estate_possessions_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES public.real_estate_properties(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_projects
ALTER TABLE public.real_estate_projects
  ADD CONSTRAINT real_estate_projects_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_properties
ALTER TABLE public.real_estate_properties
  ADD CONSTRAINT real_estate_properties_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_site_visits
ALTER TABLE public.real_estate_site_visits
  ADD CONSTRAINT real_estate_site_visits_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_site_visits
  ADD CONSTRAINT real_estate_site_visits_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.real_estate_leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_site_visits
  ADD CONSTRAINT real_estate_site_visits_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_site_visits
  ADD CONSTRAINT real_estate_site_visits_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES public.real_estate_properties(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for real_estate_units
ALTER TABLE public.real_estate_units
  ADD CONSTRAINT real_estate_units_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.real_estate_units
  ADD CONSTRAINT real_estate_units_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.real_estate_projects(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for saas_users
ALTER TABLE public.saas_users
  ADD CONSTRAINT saas_users_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.saas_organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for support_tickets
ALTER TABLE public.support_tickets
  ADD CONSTRAINT support_tickets_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.support_tickets
  ADD CONSTRAINT support_tickets_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.support_tickets
  ADD CONSTRAINT support_tickets_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for tasks
ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_contact_id_fkey
  FOREIGN KEY (contact_id) REFERENCES public.contacts(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES public.leads(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for teams
ALTER TABLE public.teams
  ADD CONSTRAINT teams_leader_fkey
  FOREIGN KEY (leader) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.teams
  ADD CONSTRAINT teams_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for ticket_comments
ALTER TABLE public.ticket_comments
  ADD CONSTRAINT ticket_comments_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.users(id)
  ON DELETE SET NULL; -- Custom rule fallback

ALTER TABLE public.ticket_comments
  ADD CONSTRAINT ticket_comments_ticket_id_fkey
  FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id)
  ON DELETE SET NULL; -- Custom rule fallback

-- Constraints for users
ALTER TABLE public.users
  ADD CONSTRAINT users_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id)
  ON DELETE SET NULL; -- Custom rule fallback


-- =====================================================
2. SEED DEFAULT SUPER ADMIN USER
-- =====================================================
-- Default Password: Innonsh@2026
-- Instruct the client to change this password after first login!

INSERT INTO public.users (
    name, 
    email, 
    password, 
    role, 
    is_active, 
    is_super_admin, 
    approval_status
) VALUES (
    'System Admin', 
    'admin@innonsh.com', 
    '$2b$10$cZIYTQRFgCn33JlB7M41RukNTl.BaVdxgrRnGQN1VjMZL6/M74dOC', 
    'superadmin', 
    true, 
    true, 
    'Approved'
);

