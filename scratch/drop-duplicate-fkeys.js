const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
const DB_URL = process.env.DATABASE_URL;

async function main() {
  if (!DB_URL) {
    console.error('DATABASE_URL is missing from .env.local');
    return;
  }

  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to PostgreSQL database.');

  try {
    console.log('Dropping duplicate foreign key constraint fk_lead_notes_lead_id...');
    await client.query('ALTER TABLE public.lead_notes DROP CONSTRAINT IF EXISTS fk_lead_notes_lead_id;');
    console.log('Successfully dropped duplicate constraint fk_lead_notes_lead_id!');

    console.log('Dropping duplicate foreign key constraint fk_deals_assigned_to...');
    await client.query('ALTER TABLE public.deals DROP CONSTRAINT IF EXISTS fk_deals_assigned_to;');
    console.log('Successfully dropped duplicate constraint fk_deals_assigned_to!');

    console.log('Dropping duplicate foreign key constraint fk_lead_attachments_lead_id...');
    await client.query('ALTER TABLE public.lead_attachments DROP CONSTRAINT IF EXISTS fk_lead_attachments_lead_id;');
    console.log('Successfully dropped duplicate constraint fk_lead_attachments_lead_id!');
  } catch (err) {
    console.error('Error dropping constraint:', err.message);
  } finally {
    await client.end();
  }
}

main();
