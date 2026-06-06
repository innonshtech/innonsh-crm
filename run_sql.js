require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const sql = fs.readFileSync('migrations/saas_setup.sql', 'utf8');
  await client.query(sql);
  console.log('saas_setup.sql executed successfully.');
  await client.end();
}
run().catch(console.error);
