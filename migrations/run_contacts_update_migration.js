const dotenv = require('dotenv');
const path = require('path');
const { Client } = require('pg');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('Altering contacts table check constraint and adding columns...');
    
    // 1. Drop check constraint if it exists (using PL/pgSQL block to handle drop constraint safely)
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'contacts_status_check'
        ) THEN
          ALTER TABLE contacts DROP CONSTRAINT contacts_status_check;
        END IF;
      END $$;
    `);
    console.log('Dropped contacts_status_check constraint (if it existed).');

    // 2. Add columns next_follow_up_date and follow_up_type
    await client.query(`
      ALTER TABLE contacts ADD COLUMN IF NOT EXISTS next_follow_up_date TIMESTAMP WITH TIME ZONE;
      ALTER TABLE contacts ADD COLUMN IF NOT EXISTS follow_up_type VARCHAR(50);
    `);
    console.log('Added next_follow_up_date and follow_up_type columns.');

    // 3. Add back the status check constraint to include 'Qualified' and 'Lost'
    await client.query(`
      ALTER TABLE contacts ADD CONSTRAINT contacts_status_check CHECK (status IN ('Active', 'Inactive', 'Qualified', 'Lost'));
    `);
    console.log('Added updated contacts_status_check constraint.');

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
