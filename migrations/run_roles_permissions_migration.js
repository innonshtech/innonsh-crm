/**
 * migrations/run_roles_permissions_migration.js
 * ----------------------------------------------
 * Directly runs the migration to add roles_permissions column to organizations table.
 * Run with: node migrations/run_roles_permissions_migration.js
 */

const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌ DATABASE_URL is missing in .env.local!');
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: DB_URL });

  console.log('\n🔌 Connecting to Supabase PostgreSQL...');
  await client.connect();
  console.log('✅ Connected successfully!\n');

  try {
    console.log('Running migration: Add roles_permissions column to organizations...');
    await client.query(`
      ALTER TABLE public.organizations 
      ADD COLUMN IF NOT EXISTS roles_permissions JSONB DEFAULT '{}'::jsonb;
    `);
    console.log('✅ Migration succeeded!');

    // Verify it
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'organizations' AND column_name = 'roles_permissions'
    `);
    if (res.rows.length > 0) {
      console.log('🔍 Verification: Column "roles_permissions" exists with type:', res.rows[0].data_type);
    } else {
      console.error('❌ Verification failed: Column "roles_permissions" not found.');
    }

  } catch (err) {
    console.error('❌ Migration failed with error:', err.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected.');
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
