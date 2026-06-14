const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to PG Database.\n');

  try {
    const { rows: users } = await client.query(
      `SELECT id, name, email FROM users`
    );
    const salesRep = users.find(u => u.email === 'vaibhav.innonsh@gmail.com');
    if (!salesRep) {
      console.log('❌ No Sales Rep user found.');
      return;
    }

    // 1. Temporarily assign Amit Kumar to Vaibhav Thorat
    console.log(`Assigning lead "Amit Kumar" to ${salesRep.name} (${salesRep.id})...`);
    await client.query(
      `UPDATE leads SET assigned_to = $1 WHERE first_name = 'Amit' AND last_name = 'Kumar'`,
      [salesRep.id]
    );

    // 2. Query visible leads for Vaibhav
    console.log('\n=== SIMULATING QUERY FOR SALES REP (AFTER ASSIGNMENT) ===');
    const query = `
      SELECT id, first_name, last_name, company, created_by, assigned_to, visibility_scope 
      FROM leads 
      WHERE org_id = $1 
        AND (
          created_by = $2 
          OR assigned_to = $2
        )
    `;
    const { rows: visibleLeads } = await client.query(query, ['52798919-80e2-48b4-a473-92608550cac6', salesRep.id]);
    console.log(`Visible leads count: ${visibleLeads.length}`);
    console.table(visibleLeads);

    // 3. Reset the assignment back to NULL
    console.log('\nResetting "Amit Kumar" lead assignment to NULL...');
    await client.query(
      `UPDATE leads SET assigned_to = NULL WHERE first_name = 'Amit' AND last_name = 'Kumar'`
    );
    console.log('✅ DB Reset complete.');

  } catch (err) {
    console.error('Error during simulation:', err);
  } finally {
    await client.end();
  }
}

main();
