require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const rlsStatements = [
  // Core Auth & Organization Tables
  `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY`,
  // CRM Module Tables
  `ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.lead_attachments ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.products ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.client_organizations ENABLE ROW LEVEL SECURITY`,
  // Settings & Tenant Tables
  `ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.module_requests ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.meta_integrations ENABLE ROW LEVEL SECURITY`,
  // Real Estate Tables
  `ALTER TABLE public.real_estate_leads ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_contacts ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_properties ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_projects ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_units ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_bookings ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_site_visits ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_documents ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_partners ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_payment_plans ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_possessions ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_blocked_units ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_lead_notes ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.real_estate_lead_attachments ENABLE ROW LEVEL SECURITY`,
  // Healthcare Tables
  `ALTER TABLE public.healthcare_leads ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.healthcare_patients ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.healthcare_doctors ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.healthcare_appointments ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.healthcare_admissions ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.healthcare_medical_records ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.healthcare_lab_tests ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.healthcare_prescriptions ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.healthcare_pharmacy ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.healthcare_billing ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.healthcare_claims ENABLE ROW LEVEL SECURITY`,
];

// Deny-all anon policies — one per table
const denyPolicies = [
  'users', 'organizations', 'active_sessions', 'audit_logs',
  'leads', 'lead_notes', 'lead_attachments', 'contacts', 'deals',
  'tasks', 'calls', 'meetings', 'emails', 'notifications', 'products',
  'quotations', 'invoices', 'client_organizations',
  'custom_field_definitions', 'module_requests', 'meta_integrations',
];

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  console.log('🔌 Connecting to database...');
  await client.connect();
  console.log('✅ Connected.\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Step 1: Enable RLS on all tables
  console.log('--- Step 1: Enabling Row Level Security on all tables ---');
  for (const sql of rlsStatements) {
    const tableName = sql.match(/public\.(\w+)/)[1];
    try {
      await client.query(sql);
      console.log(`  ✅ RLS enabled: ${tableName}`);
      successCount++;
    } catch (err) {
      if (err.message.includes('does not exist')) {
        console.log(`  ⏭️  Skipped (table not found): ${tableName}`);
        skipCount++;
      } else {
        console.error(`  ❌ Error on ${tableName}: ${err.message}`);
        errorCount++;
      }
    }
  }

  // Step 2: Create deny-all anon policies
  console.log('\n--- Step 2: Creating deny-all policies for anon role ---');
  for (const table of denyPolicies) {
    try {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = '${table}' AND policyname = 'Deny anon access'
          ) THEN
            EXECUTE 'CREATE POLICY "Deny anon access" ON public.${table} AS RESTRICTIVE FOR ALL TO anon USING (false)';
          END IF;
        END
        $$;
      `);
      console.log(`  ✅ Deny policy set: ${table}`);
    } catch (err) {
      if (err.message.includes('does not exist')) {
        console.log(`  ⏭️  Skipped (table not found): ${table}`);
      } else {
        console.error(`  ❌ Error on ${table}: ${err.message}`);
        errorCount++;
      }
    }
  }

  console.log(`\n🎉 RLS Migration Complete!`);
  console.log(`   ✅ Success: ${successCount} | ⏭️  Skipped: ${skipCount} | ❌ Errors: ${errorCount}`);
  
  await client.end();
}

run().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
