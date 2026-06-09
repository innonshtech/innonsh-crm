const dotenv = require('dotenv');
const path = require('path');
const { Client } = require('pg');

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
    console.log('Healing contacts missing lead_id...');

    // 1. Fetch contacts missing lead_id
    const { rows: brokenContacts } = await client.query(`
      SELECT * FROM contacts WHERE lead_id IS NULL;
    `);

    console.log(`Found ${brokenContacts.length} contacts missing lead_id.`);

    for (const contact of brokenContacts) {
      console.log(`Creating Qualified lead for contact: ${contact.first_name} ${contact.last_name || ''}`);
      
      // Create lead
      const { rows: newLeads } = await client.query(`
        INSERT INTO leads (
          first_name, last_name, company, designation, email, phone, whatsapp, 
          city, state, country, assigned_to, status, org_id, custom_data
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Qualified', $12, $13
        ) RETURNING id;
      `, [
        contact.first_name,
        contact.last_name || '',
        contact.company || '',
        contact.designation || '',
        contact.email || '',
        contact.phone || '',
        contact.whatsapp || '',
        contact.city || '',
        contact.state || '',
        contact.country || 'India',
        contact.assigned_to,
        contact.org_id,
        contact.custom_data || {}
      ]);

      const leadId = newLeads[0].id;

      // Update contact
      await client.query(`
        UPDATE contacts SET lead_id = $1 WHERE id = $2;
      `, [leadId, contact.id]);

      console.log(`Contact ${contact.first_name} successfully linked to lead ${leadId}.`);
    }

    console.log('Database healing completed successfully!');
  } catch (err) {
    console.error('Database healing failed:', err);
  } finally {
    await client.end();
  }
}

run();
