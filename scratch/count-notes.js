const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, first_name, lead_notes(count)');

  if (error) {
    console.error(error);
    return;
  }

  let leadsWithNotes = 0;
  leads.forEach((l) => {
    const noteCount = l.lead_notes ? l.lead_notes.length : 0;
    if (noteCount > 0) leadsWithNotes++;
  });

  console.log(`Total Leads: ${leads.length}`);
  console.log(`Leads with notes: ${leadsWithNotes}`);
}

main();
