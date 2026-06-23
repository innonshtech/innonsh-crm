const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkFollowups() {
  const { data, error } = await supabase
    .from('leads')
    .select('id, first_name, last_name, company, next_follow_up_date, follow_up_type, status')
    .not('next_follow_up_date', 'is', null)
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Leads with follow-up date: ${data.length}`);
  data.forEach((l) => {
    console.log(`[${l.id}] Name: ${l.first_name} | Date: ${l.next_follow_up_date} | Type: ${l.follow_up_type} | Status: ${l.status}`);
  });
}

checkFollowups();
