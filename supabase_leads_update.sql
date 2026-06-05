-- ==========================================
-- ADD LEAD VISIBILITY AND OWNERSHIP FIELDS
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Add fields to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS visibility_scope VARCHAR(50) DEFAULT 'PRIVATE';

-- 2. Backfill existing leads: set owner_id and created_by to assigned_to (if exists) or a default admin
UPDATE public.leads
SET 
  created_by = assigned_to,
  owner_id = assigned_to,
  visibility_scope = 'GLOBAL' -- Legacy leads can be set to global or assigned
WHERE created_by IS NULL;
