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
    const res = await client.query(
      "UPDATE public.users SET org_id = '52798919-80e2-48b4-a473-92608550cac6' WHERE email = 'owner@mycompany.com'"
    );
    console.log('Update result:', res.rowCount);
  } catch (err) {
    console.error('Error executing query:', err.stack);
  } finally {
    await client.end();
  }
}

main();
