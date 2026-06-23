const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// mock dbMapper logic
function mapLeadToFrontend(lead) {
  if (!lead) return null;
  return {
    id: lead.id,
    firstName: lead.first_name,
    lastName: lead.last_name || '',
    company: lead.company,
    nextFollowUpDate: lead.next_follow_up_date || null,
    notes: lead.lead_notes ? lead.lead_notes.map(n => ({
      id: n.id,
      text: n.text,
      createdAt: n.created_at,
    })) : [],
    createdAt: lead.created_at,
  };
}

async function testSort() {
  const { data, error } = await supabase
    .from('leads')
    .select('*, lead_notes(*)')
    .eq('org_id', '52798919-80e2-48b4-a473-92608550cac6');

  if (error) {
    console.error('Supabase query error:', error);
    return;
  }

  const leads = data.map(mapLeadToFrontend);

  // Sort by latest_communication with nextFollowUpDate included
  leads.sort((a, b) => {
    const aLatest = Math.max(
      new Date(a.createdAt || 0).getTime() || 0,
      new Date(a.nextFollowUpDate || 0).getTime() || 0,
      ...(a.notes || []).map((n) => new Date(n.createdAt || 0).getTime() || 0)
    );
    const bLatest = Math.max(
      new Date(b.createdAt || 0).getTime() || 0,
      new Date(b.nextFollowUpDate || 0).getTime() || 0,
      ...(b.notes || []).map((n) => new Date(n.createdAt || 0).getTime() || 0)
    );
    return bLatest - aLatest;
  });

  console.log('Top 10 leads sorted by latest follow-up/communication:');
  leads.slice(0, 10).forEach((l, idx) => {
    const latestTime = Math.max(
      new Date(l.createdAt || 0).getTime() || 0,
      new Date(l.nextFollowUpDate || 0).getTime() || 0,
      ...l.notes.map(n => new Date(n.createdAt || 0).getTime() || 0)
    );
    console.log(`${idx + 1}. Lead: ${l.id} | Name: ${l.firstName} | FollowUpDate: ${l.nextFollowUpDate} | Notes count: ${l.notes.length} | Latest time: ${new Date(latestTime).toISOString()}`);
  });
}

testSort();
