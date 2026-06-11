const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: lead, error } = await supabase
    .from('leads')
    .select('*, lead_notes(*)')
    .eq('id', '3178e07c-f754-4378-80ba-444b10e50c70')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Lead Details from Database:');
  console.log(JSON.stringify(lead, null, 2));
}

main();
