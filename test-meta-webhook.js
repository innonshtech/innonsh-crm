const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 1. Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log('🔌 Connected to Supabase...');
  
  // 2. Fetch a valid organization and user to use for the test
  console.log('🔍 Fetching an organization and owner user from database...');
  const { data: testUser, error: userError } = await supabase
    .from('users')
    .select('org_id, id, name, role')
    .eq('role', 'owner')
    .limit(1)
    .maybeSingle();

  if (userError || !testUser) {
    console.error('❌ Could not find an owner user or organization in your database:', userError || 'No owner found');
    console.log('Please make sure you have at least one user with the role "owner" in the "users" table.');
    return;
  }

  const orgId = testUser.org_id;
  console.log(`✅ Found organization ID: ${orgId}`);
  console.log(`✅ Found owner: ${testUser.name} (ID: ${testUser.id})`);

  // 3. Upsert a mock Meta integration configuration for testing
  const mockPageId = 'test_page_12345';
  const mockFormId = 'test_form_67890';
  
  console.log('\n⚙️  Setting up a mock Meta integration configuration...');
  
  // Find if a configuration already exists for this org
  const { data: existingConfig, error: findConfigError } = await supabase
    .from('meta_integrations')
    .select('id')
    .eq('org_id', orgId)
    .maybeSingle();

  if (findConfigError) {
    console.error('❌ Failed to check for existing Meta integration:', findConfigError);
    return;
  }

  let config;
  let configError;

  if (existingConfig) {
    console.log('   - Existing configuration found. Updating...');
    const { data, error } = await supabase
      .from('meta_integrations')
      .update({
        page_id: mockPageId,
        page_name: 'Test Facebook Page',
        page_access_token: 'mock_token_abc123xyz',
        form_id: mockFormId,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingConfig.id)
      .select('*')
      .single();
    config = data;
    configError = error;
  } else {
    console.log('   - No existing configuration. Inserting new...');
    const { data, error } = await supabase
      .from('meta_integrations')
      .insert([
        {
          org_id: orgId,
          page_id: mockPageId,
          page_name: 'Test Facebook Page',
          page_access_token: 'mock_token_abc123xyz',
          form_id: mockFormId
        }
      ])
      .select('*')
      .single();
    config = data;
    configError = error;
  }

  if (configError) {
    console.error('❌ Failed to setup mock Meta integration:', configError);
    return;
  }
  console.log(`✅ Meta integration mock config created/updated for Org ID: ${orgId}`);

  // 4. Define Mock Lead Data (representing what Meta's Graph API would return)
  // We bypass the external fetch of FB Graph API since we are testing local processing logic
  const mockMetaLeadId = `lead_meta_${Math.floor(Math.random() * 1000000)}`;
  const mockRawLead = {
    id: mockMetaLeadId,
    field_data: [
      { name: 'full_name', values: ['Test Meta User'] },
      { name: 'email', values: [`meta.test.${Math.floor(Math.random() * 100000)}@example.com`] },
      { name: 'phone', values: [`+9198765${Math.floor(10000 + Math.random() * 90000)}`] },
      { name: 'city', values: ['Mumbai'] },
      { name: 'custom_question', values: ['I want a demo of the CRM software'] }
    ]
  };

  console.log('\n📦 Simulating Webhook POST Payload processing logic:');
  console.log(`   - Form ID: ${mockFormId}`);
  console.log(`   - Page ID: ${mockPageId}`);
  console.log(`   - Meta Lead ID: ${mockMetaLeadId}`);

  // 5. Run Webhook Parsing Logic (Extracting fields)
  let email = '';
  let phone = '';
  let firstName = '';
  let lastName = '';
  const customData = {};

  if (mockRawLead.field_data) {
    for (const field of mockRawLead.field_data) {
      const name = field.name.toLowerCase();
      const value = field.values && field.values[0] ? field.values[0] : '';

      if (name === 'email') {
        email = value;
      } else if (name === 'phone_number' || name === 'phone') {
        phone = value;
      } else if (name === 'first_name') {
        firstName = value;
      } else if (name === 'last_name') {
        lastName = value;
      } else if (name === 'full_name') {
        if (!firstName) {
          const parts = value.trim().split(/\s+/);
          firstName = parts[0];
          lastName = parts.slice(1).join(' ');
        }
      } else {
        customData[field.name] = value;
      }
    }
  }

  if (!firstName) {
    firstName = 'Meta';
    lastName = 'Lead';
  }

  console.log('👉 Parsed Data:');
  console.log(`   - Name: ${firstName} ${lastName}`);
  console.log(`   - Email: ${email}`);
  console.log(`   - Phone: ${phone}`);
  console.log('   - Custom Data:', customData);

  // 6. Duplicate Check (Email & Phone)
  console.log('\n🔍 Running duplicate lead check...');
  let isDuplicate = false;
  if (email && email.trim()) {
    const { data: dupEmail } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (dupEmail) {
      console.log(`⚠️ Duplicate lead found with Email "${email}". Skipping.`);
      isDuplicate = true;
    }
  }

  if (!isDuplicate && phone && phone.trim()) {
    const { data: dupPhone } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', phone.trim())
      .maybeSingle();

    if (dupPhone) {
      console.log(`⚠️ Duplicate lead found with Phone "${phone}". Skipping.`);
      isDuplicate = true;
    }
  }

  if (isDuplicate) {
    console.log('❌ Test stopped: Lead already exists.');
    return;
  }
  console.log('✅ Duplicate check passed (No match found).');

  // 7. Assignee Determination (Round-Robin)
  console.log('\n👤 Determining assignee...');
  let finalAssignee = null;
  const { data: activeReps } = await supabase
    .from('users')
    .select('id')
    .eq('org_id', config.org_id)
    .eq('role', 'sales_rep')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (activeReps && activeReps.length > 0) {
    console.log(`   - Found ${activeReps.length} active Sales Reps.`);
    const repIds = activeReps.map(r => r.id);
    const { data: lastLead } = await supabase
      .from('leads')
      .select('assigned_to')
      .in('assigned_to', repIds)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastLead && lastLead.assigned_to) {
      const lastRepIndex = activeReps.findIndex(r => r.id === lastLead.assigned_to);
      const nextRepIndex = (lastRepIndex + 1) % activeReps.length;
      finalAssignee = activeReps[nextRepIndex].id;
      console.log(`   - Last assigned to Rep index ${lastRepIndex}. Assigning to next Rep index ${nextRepIndex} (ID: ${finalAssignee}).`);
    } else {
      finalAssignee = activeReps[0].id;
      console.log(`   - No previous leads assigned to active reps. Assigning to first Rep (ID: ${finalAssignee}).`);
    }
  }

  if (!finalAssignee) {
    console.log('   - No active sales reps. Falling back to organization owner...');
    const { data: owner } = await supabase
      .from('users')
      .select('id')
      .eq('org_id', config.org_id)
      .eq('role', 'owner')
      .limit(1)
      .maybeSingle();
    if (owner) {
      finalAssignee = owner.id;
      console.log(`   - Assigned to Owner (ID: ${finalAssignee}).`);
    }
  }

  // 8. Create the Lead
  console.log('\n➕ Creating Lead in the "leads" table...');
  const { data: newLead, error: insertError } = await supabase
    .from('leads')
    .insert([
      {
        first_name: firstName,
        last_name: lastName || '',
        company: 'Meta Ads',
        designation: 'Lead from Instagram/Facebook (Test)',
        email: email || '',
        phone: phone || '',
        whatsapp: phone || '',
        website: '',
        city: customData['city'] || '',
        state: '',
        country: 'India',
        industry: '',
        employee_count: 0,
        annual_revenue: 0,
        priority: 'Warm',
        status: 'New',
        lost_reason: '',
        source: 'Social Media',
        requirements: `Form Name/ID: ${mockFormId}\nMeta Lead ID: ${mockMetaLeadId}\nTest custom details: ${customData['custom_question'] || 'None'}`,
        interested_product: '',
        follow_up_type: 'None',
        next_follow_up_date: null,
        assigned_to: finalAssignee,
        custom_fields: [],
        custom_data: customData,
        org_id: config.org_id
      }
    ])
    .select('*')
    .single();

  if (insertError) {
    console.error('❌ Supabase error inserting Meta lead:', insertError);
    return;
  }

  console.log(`✅ Successfully created Meta Lead: ID ${newLead.id}, Name: ${firstName} ${lastName}`);

  // 9. Log timeline creation note
  console.log('📝 Creating activity timeline note for the lead...');
  const { error: noteError } = await supabase
    .from('lead_notes')
    .insert([
      {
        lead_id: newLead.id,
        text: `Lead created automatically via Meta Webhook (Lead ID: ${mockMetaLeadId}, Form ID: ${mockFormId}) [TEST SIMULATION]`,
        created_by: finalAssignee,
        created_by_name: 'Meta Integration'
      }
    ]);

  if (noteError) {
    console.error('❌ Failed to insert lead note:', noteError);
  } else {
    console.log('✅ Lead note inserted successfully.');
  }

  console.log('\n🎉 Test completed successfully! Check your Leads dashboard in the CRM UI, you should see the new lead "Test Meta User".');
}

runTest().catch(console.error);
