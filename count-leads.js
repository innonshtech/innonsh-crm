const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function countLeads() {
  const orgId = '52798919-80e2-48b4-a473-92608550cac6';
  
  // 1. Fetch total count of leads for this organization
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, first_name, last_name, company, status, created_at')
    .eq('org_id', orgId);

  if (error) {
    console.error('Error fetching leads:', error);
    return;
  }

  console.log(`Total Leads found for Org ID ${orgId}: ${leads.length}`);
  console.log('\nSample Leads list:');
  leads.forEach((l, index) => {
    console.log(`${index + 1}. [${l.id}] ${l.first_name} ${l.last_name || ''} - Company: ${l.company || 'N/A'}, Status: ${l.status}, CreatedAt: ${l.created_at}`);
  });
}

countLeads();
