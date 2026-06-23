const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase
    .from('lead_notes')
    .select('*')
    .eq('lead_id', 'b38bc92e-5b85-4dfc-8ad3-a4949b5200db');

  if (error) {
    console.error(error);
    return;
  }
  console.log('Notes for b38bc92e-5b85-4dfc-8ad3-a4949b5200db:', data);
}

main();
