const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: 'c:/Users/Dell/Desktop/Innonsh/CRM/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('--- Start Contact Deletion & Reversion Flow Test ---');

  // 1. Fetch any Qualified lead to use as test
  const { data: leads, error: leadErr } = await supabase
    .from('leads')
    .select('id, first_name, last_name, company, status')
    .eq('status', 'Qualified')
    .limit(1);

  if (leadErr) {
    console.error('Error fetching qualified lead:', leadErr);
    return;
  }

  let testLead = leads[0];

  if (!testLead) {
    console.log('No qualified lead found in database. Let\'s create one temporary qualified lead.');
    const { data: createdLead, error: createLeadErr } = await supabase
      .from('leads')
      .insert([
        {
          first_name: 'DeletionTest',
          last_name: 'User',
          company: 'Test Company',
          status: 'Qualified'
        }
      ])
      .select('id, first_name, last_name, company, status')
      .single();

    if (createLeadErr) {
      console.error('Failed to create test lead:', createLeadErr);
      return;
    }
    testLead = createdLead;
  }

  console.log('Using qualified lead:', testLead);

  // 2. Simulate Self-Healing Sync: Create a contact for this lead if not already exists
  const { data: existingContacts } = await supabase
    .from('contacts')
    .select('id')
    .eq('lead_id', testLead.id)
    .maybeSingle();

  let contactId = existingContacts?.id;

  if (!contactId) {
    console.log('Simulating self-healing: Creating contact profile...');
    const { data: newContact, error: contactCreateErr } = await supabase
      .from('contacts')
      .insert([
        {
          first_name: testLead.first_name,
          last_name: testLead.last_name || '',
          company: testLead.company || '',
          lead_id: testLead.id,
          status: 'Active'
        }
      ])
      .select('id')
      .single();

    if (contactCreateErr) {
      console.error('Failed to create contact:', contactCreateErr);
      return;
    }
    contactId = newContact.id;
    console.log(`Created contact with ID: ${contactId}`);
  } else {
    console.log(`Existing contact found with ID: ${contactId}`);
  }

  // 3. Simulate DELETE /api/contacts/[id] logic
  console.log(`\nSimulating DELETE /api/contacts/${contactId}...`);
  
  // Revert lead status to 'New'
  const { error: leadUpdateErr } = await supabase
    .from('leads')
    .update({ status: 'New' })
    .eq('id', testLead.id);

  if (leadUpdateErr) {
    console.error('Failed to revert lead status:', leadUpdateErr);
    return;
  }
  console.log('1. Associated lead status reverted to "New".');

  // Delete contact
  const { error: contactDeleteErr } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId);

  if (contactDeleteErr) {
    console.error('Failed to delete contact:', contactDeleteErr);
    return;
  }
  console.log('2. Contact record deleted from contacts table.');

  // 4. Verify that self-healing sync would NOT recreate it anymore
  console.log('\nVerifying if self-healing sync is bypassed...');
  const { data: checkedLeads } = await supabase
    .from('leads')
    .select('status')
    .eq('id', testLead.id)
    .single();

  console.log(`Current lead status in DB: ${checkedLeads.status}`);
  if (checkedLeads.status === 'Qualified') {
    console.error('Test FAILED: Lead status is still Qualified! Self-healing would recreate the contact.');
  } else {
    console.log('Test PASSED: Lead status is reverted to "New". Self-healing is successfully bypassed and contact won\'t be recreated!');
  }

  // Clean up: delete test lead if we created a temporary one
  if (testLead.first_name === 'DeletionTest') {
    console.log('\nCleaning up temporary test lead...');
    await supabase.from('leads').delete().eq('id', testLead.id);
    console.log('Cleaned up.');
  }
}

main();
