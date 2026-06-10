require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function check() {
  await client.connect();
  console.log('Connected.\n');

  // Tables with RLS ON
  const { rows: rlsOn } = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true ORDER BY tablename"
  );
  console.log('=== TABLES WITH RLS ENABLED ===');
  console.log('  Total:', rlsOn.length);
  rlsOn.forEach(r => console.log('  ✅', r.tablename));

  // Tables with RLS OFF
  const { rows: rlsOff } = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false ORDER BY tablename"
  );
  console.log('\n=== TABLES WITH RLS DISABLED (Potential Risk) ===');
  if (rlsOff.length === 0) {
    console.log('  ✅ None — all public tables are protected!');
  } else {
    rlsOff.forEach(r => console.log('  ⚠️ ', r.tablename));
  }

  // Active policies
  const { rows: policies } = await client.query(
    "SELECT tablename, policyname, cmd, roles FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename"
  );
  console.log('\n=== ACTIVE RLS POLICIES ===');
  console.log('  Total policies:', policies.length);
  policies.forEach(p => console.log('  ', p.tablename, '|', p.policyname, '| cmd:', p.cmd, '| roles:', p.roles));

  // Check lead_attachments has new columns
  const { rows: cols } = await client.query(
    "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'lead_attachments' AND table_schema = 'public' ORDER BY ordinal_position"
  );
  console.log('\n=== lead_attachments COLUMNS ===');
  cols.forEach(c => console.log(' ', c.column_name, '-', c.data_type, '- nullable:', c.is_nullable));

  await client.end();
}

check().catch(e => { console.error('Error:', e.message); client.end(); });
