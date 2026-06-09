const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: 'c:/Users/Dell/Desktop/Innonsh/CRM/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // Let's get one contact first
  const { data: contacts, error: getErr } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .limit(1);

  if (getErr || contacts.length === 0) {
    console.error('Error fetching contact:', getErr);
    return;
  }

  const target = contacts[0];
  console.log(`Attempting to delete contact: ${target.first_name} ${target.last_name} (ID: ${target.id})...`);

  const { error: deleteErr } = await supabase
    .from('contacts')
    .delete()
    .eq('id', target.id);

  if (deleteErr) {
    console.error('Deletion failed with error:');
    console.error(JSON.stringify(deleteErr, null, 2));
  } else {
    console.log('Deletion succeeded! (Note: contact was deleted, if this was production data we should restore or use a dummy contact for tests).');
  }
}

main();
