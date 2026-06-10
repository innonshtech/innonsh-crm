require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  console.log('🔌 Connecting to database...');
  await client.connect();
  console.log('✅ Connected.\n');

  try {
    // Step 1: Add file_url column to lead_attachments (keep file_data for backward compat)
    console.log('📋 Step 1: Adding file_url and storage_path columns to lead_attachments...');
    await client.query(`
      ALTER TABLE public.lead_attachments
        ADD COLUMN IF NOT EXISTS file_url TEXT,
        ADD COLUMN IF NOT EXISTS storage_path TEXT,
        ALTER COLUMN file_data DROP NOT NULL;
    `);
    console.log('  ✅ lead_attachments updated.');

    // Step 2: Add same columns to real_estate_lead_attachments if it exists
    console.log('📋 Step 2: Checking real_estate_lead_attachments...');
    const { rows } = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'real_estate_lead_attachments'
      ) AS exists;
    `);

    if (rows[0].exists) {
      await client.query(`
        ALTER TABLE public.real_estate_lead_attachments
          ADD COLUMN IF NOT EXISTS file_url TEXT,
          ADD COLUMN IF NOT EXISTS storage_path TEXT,
          ALTER COLUMN file_data DROP NOT NULL;
      `);
      console.log('  ✅ real_estate_lead_attachments updated.');
    } else {
      console.log('  ⏭️  real_estate_lead_attachments not found, skipping.');
    }

    console.log('\n🎉 Storage migration complete!');
    console.log('\n📌 Next step:');
    console.log('   Go to Supabase Dashboard → Storage → Create bucket named: crm-attachments');
    console.log('   Set it as PRIVATE (not public).');

  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
}

run();
