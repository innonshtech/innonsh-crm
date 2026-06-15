const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function getAllLeads() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, first_name, last_name, company, org_id, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    return;
  }

  console.log(`Total Leads in entire database: ${leads.length}`);
  leads.forEach((l, index) => {
    console.log(`${index + 1}. [${l.id}] Name: ${l.first_name} ${l.last_name || ''} | Company: ${l.company} | Org: ${l.org_id} | CreatedAt: ${l.created_at}`);
  });
}

getAllLeads();
