require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query('SELECT email, role, is_super_admin FROM users;');
    console.log('Users in DB:');
    console.table(res.rows);
  } catch (error) {
    console.error('Error querying users:', error);
  } finally {
    await client.end();
  }
}

run();
