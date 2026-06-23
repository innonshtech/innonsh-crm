const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, first_name, lead_notes(count)')
    .eq('org_id', '52798919-80e2-48b4-a473-92608550cac6');

  if (error) {
    console.error(error);
    return;
  }

  let leadsWithNotes = 0;
  leads.forEach((l) => {
    const count = l.lead_notes && l.lead_notes[0] ? l.lead_notes[0].count : 0;
    if (count > 0) leadsWithNotes++;
  });

  console.log(`Total Leads in Org: ${leads.length}`);
  console.log(`Leads with actual notes in Org: ${leadsWithNotes}`);
}

main();
