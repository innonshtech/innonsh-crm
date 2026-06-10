require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const rlsStatements = [
  `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.saas_organizations ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.saas_users ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY`
];

const denyPolicies = [
  'users',
  'saas_organizations',
  'saas_users',
  'support_tickets',
  'teams',
  'ticket_comments'
];

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  console.log('🔌 Connecting to database...');
  await client.connect();
  console.log('✅ Connected.\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Step 1: Enable RLS on the missing tables
  console.log('--- Step 1: Enabling Row Level Security on missing tables ---');
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
      console.log(`  ✅ Deny policy set/verified: ${table}`);
    } catch (err) {
      if (err.message.includes('does not exist')) {
        console.log(`  ⏭️  Skipped (table not found): ${table}`);
      } else {
        console.error(`  ❌ Error on ${table}: ${err.message}`);
        errorCount++;
      }
    }
  }

  console.log(`\n🎉 Missing Tables RLS Migration Complete!`);
  console.log(`   ✅ Success: ${successCount} | ⏭️  Skipped: ${skipCount} | ❌ Errors: ${errorCount}`);
  
  await client.end();
}

run().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
