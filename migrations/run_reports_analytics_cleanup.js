const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌ DATABASE_URL is not defined in your env variables.');
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: DB_URL });
  console.log('🔌 Connecting to database...');
  await client.connect();
  console.log('✅ Connected successfully!');

  console.log('🔄 Running migration to consolidate Reports and Analytics modules...');
  
  // Update public.organizations to remove 'analytics' and make sure 'reports' is present
  const query = `
    UPDATE public.organizations
    SET enabled_modules = array_remove(enabled_modules, 'analytics')
    WHERE 'analytics' = ANY(enabled_modules);
  `;
  
  const res = await client.query(query);
  console.log(`✅ Success! Updated ${res.rowCount} organization records.`);

  await client.end();
  console.log('👋 Database connection closed.');
}

main().catch(err => {
  console.error('💥 Error running migration:', err);
  process.exit(1);
});
