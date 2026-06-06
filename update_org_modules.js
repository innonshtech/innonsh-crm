require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const modules = [
      'leads', 'deals', 'contacts', 'tasks', 'emails', 'calls', 'meetings', 
      'products', 'quotations', 'invoices', 'reports', 'analytics', 
      'users', 'roles', 'teams', 'support'
    ];
    
    // Update the organization Amit belongs to
    const res = await client.query(`
      UPDATE organizations 
      SET enabled_modules = $1 
      WHERE id = '52798919-80e2-48b4-a473-92608550cac6'
      RETURNING *;
    `, [modules]);
    
    console.log('Successfully updated organization modules:', res.rows[0].enabled_modules);
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}

run();
