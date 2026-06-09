const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: 'c:/Users/Dell/Desktop/Innonsh/CRM/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, company, email, phone');

  if (error) {
    console.error('Error fetching contacts:', error);
  } else {
    console.log(`Total contacts: ${data.length}`);
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
