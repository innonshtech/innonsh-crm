require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(`SELECT * FROM users WHERE email = 'amit.gangajaliwale@innonsh.com';`);
    console.log('User:', res.rows[0]);
    if (res.rows[0] && res.rows[0].org_id) {
      const orgRes = await client.query(`SELECT * FROM organizations WHERE id = $1;`, [res.rows[0].org_id]);
      console.log('Organization:', orgRes.rows[0]);
    }
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}

run();
