const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  await client.connect();
  try {
    const res = await client.query('SELECT org_id, COUNT(*) FROM public.leads GROUP BY org_id');
    console.log('CRM Database Leads count by org_id:');
    console.log(res.rows);
  } catch (err) {
    console.error('Error executing query:', err.stack);
  } finally {
    await client.end();
  }
}

main();
