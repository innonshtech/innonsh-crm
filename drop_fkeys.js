require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('Dropping duplicate foreign keys...');
    
    // We keep the old ones (fk_deals_assigned_to, fk_lead_notes_lead_id) and drop the newly created ones
    // by the saas_setup.sql if they exist, or we can just drop the old ones. 
    // It's safer to just drop one set. Let's drop the ones mentioned in the error: fk_deals_assigned_to, etc.
    // Wait, the error is:
    // 'deals_assigned_to_fkey using deals(assigned_to) and users(id)'
    // 'fk_deals_assigned_to using deals(assigned_to) and users(id)'
    await client.query(`ALTER TABLE deals DROP CONSTRAINT IF EXISTS fk_deals_assigned_to;`);
    
    // 'fk_lead_notes_lead_id using leads(id) and lead_notes(lead_id)'
    await client.query(`ALTER TABLE lead_notes DROP CONSTRAINT IF EXISTS fk_lead_notes_lead_id;`);
    
    // Drop lead_attachments duplicate
    await client.query(`ALTER TABLE lead_attachments DROP CONSTRAINT IF EXISTS fk_lead_attachments_lead_id;`);
    
    console.log('Successfully dropped duplicate constraints.');
  } catch (error) {
    console.error('Error dropping constraints:', error);
  } finally {
    await client.end();
  }
}

run();
