const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase
    .from('lead_notes')
    .insert([
      {
        lead_id: 'e137a5af-ef49-463f-bbc6-d31c0f81324c',
        text: 'Test note added today for sorting check',
        created_by: 'de76d8ec-6582-40bf-8dc9-0804be766edd',
        created_by_name: 'Innonsh Owner',
      }
    ])
    .select('*')
    .single();

  if (error) {
    console.error(error);
    return;
  }
  console.log('Added note:', data);
}

main();
