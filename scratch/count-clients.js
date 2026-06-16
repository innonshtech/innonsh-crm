const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function countClients() {
  const orgId = '52798919-80e2-48b4-a473-92608550cac6';
  
  // 1. Fetch total count of client organizations
  const { data: clients, error } = await supabase
    .from('client_organizations')
    .select('id, name, created_at, org_id');

  if (error) {
    console.error('Error fetching client_organizations:', error);
    return;
  }

  console.log(`Total Client Organizations globally: ${clients.length}`);
  clients.forEach((c, index) => {
    console.log(`${index + 1}. [${c.id}] ${c.name} | Org ID: ${c.org_id} | CreatedAt: ${c.created_at}`);
  });
}

countClients();
