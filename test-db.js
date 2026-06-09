const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Fetching contacts...');
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email, phone, status, lead_id');
  if (contactsError) {
    console.error('Error fetching contacts:', contactsError);
    return;
  }
  console.log('Contacts list:');
  console.log(contacts);

  console.log('Fetching qualified/lost leads...');
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('id, first_name, last_name, status')
    .in('status', ['Qualified', 'Lost', 'New']);
  if (leadsError) {
    console.error('Error fetching leads:', leadsError);
    return;
  }
  console.log('Leads list (sample):');
  console.log(leads.slice(0, 10));
}

main();
