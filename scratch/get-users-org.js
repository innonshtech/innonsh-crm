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
    const res = await client.query('SELECT id, name, email, role, org_id FROM public.users');
    console.log('CRM Database Users Org IDs:');
    console.log(res.rows);
  } catch (err) {
    console.error('Error executing query:', err.stack);
  } finally {
    await client.end();
  }
}

main();
