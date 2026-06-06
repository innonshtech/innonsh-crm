require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('Dropping role constraint...');
    await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;');
    
    console.log('Adding new role constraint with admin...');
    await client.query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'superadmin', 'owner', 'sales_admin', 'sales_rep'));`);
    
    console.log('Updating admin@innonsh.com role to admin...');
    await client.query(`UPDATE users SET role = 'admin' WHERE email = 'admin@innonsh.com';`);
    
    console.log('Successfully updated role to admin.');
  } catch (error) {
    console.error('Error updating role:', error);
  } finally {
    await client.end();
  }
}

run();
