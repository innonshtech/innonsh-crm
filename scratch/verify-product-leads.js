const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { Client } = require('pg');
const { checkLeadVisibility } = require('../src/lib/auth');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to Supabase PG Database.\n');

  try {
    // 1. Fetch organizations to see if roles_permissions column exists and has custom permissions
    console.log('--- Checking Organization Roles Permissions ---');
    const { rows: orgs } = await client.query(
      `SELECT id, name, roles_permissions FROM organizations LIMIT 5`
    );
    
    if (orgs.length === 0) {
      console.log('No organizations found.');
      return;
    }

    const targetOrg = orgs[0];
    console.log(`Org ID: ${targetOrg.id}`);
    console.log(`Org Name: ${targetOrg.name}`);
    console.log(`Roles Permissions Matrix:\n`, JSON.stringify(targetOrg.roles_permissions, null, 2));

    // 2. Fetch Owner and Sales Rep users for this org
    const { rows: users } = await client.query(
      `SELECT id, name, email, role, org_id FROM users WHERE org_id = $1`,
      [targetOrg.id]
    );
    
    const ownerUser = users.find(u => u.role === 'owner');
    const salesRepUser = users.find(u => u.role === 'sales_rep');

    if (!ownerUser || !salesRepUser) {
      console.log('Missing owner or sales rep user in the organization.');
      return;
    }

    console.log(`\nOwner User: ${ownerUser.name} (${ownerUser.email})`);
    console.log(`Sales Rep User: ${salesRepUser.name} (${salesRepUser.email})`);

    // 3. Perform Simulated Visibility Check
    // Create a mock website lead (Product Lead)
    const mockWebsiteLead = {
      id: 'mock-lead-id-123',
      first_name: 'John',
      last_name: 'Doe',
      company: 'Acme Corp',
      source: 'Website',
      created_by: null,
      assigned_to: null,
      is_public: false
    };

    console.log('\n--- SIMULATING VISIBILITY FOR WEBSITE LEAD (source = "Website") ---');
    
    // Check when permission is No
    const tempPermissionsNo = {
      ...targetOrg.roles_permissions,
      sales_rep: [
        ...(targetOrg.roles_permissions.sales_rep || []).filter(p => p.module !== 'Product Leads'),
        { module: 'Product Leads', read: 'No', write: 'No', delete: 'No' }
      ]
    };
    
    const visibleNo = checkLeadVisibility(mockWebsiteLead, salesRepUser, tempPermissionsNo);
    console.log(`When Sales Rep Product Leads Read Scope is 'No':`);
    console.log(`-> Sales Rep Visibility: ${visibleNo ? '✅ VISIBLE' : '❌ HIDDEN'} (Expected: HIDDEN)`);

    // Check when permission is Global
    const tempPermissionsGlobal = {
      ...targetOrg.roles_permissions,
      sales_rep: [
        ...(targetOrg.roles_permissions.sales_rep || []).filter(p => p.module !== 'Product Leads'),
        { module: 'Product Leads', read: 'Global', write: 'No', delete: 'No' }
      ]
    };
    
    const visibleGlobal = checkLeadVisibility(mockWebsiteLead, salesRepUser, tempPermissionsGlobal);
    console.log(`When Sales Rep Product Leads Read Scope is 'Global':`);
    console.log(`-> Sales Rep Visibility: ${visibleGlobal ? '✅ VISIBLE' : '❌ HIDDEN'} (Expected: VISIBLE)`);

    // Check when permission is Assigned Only (lead NOT assigned)
    const tempPermissionsAssigned = {
      ...targetOrg.roles_permissions,
      sales_rep: [
        ...(targetOrg.roles_permissions.sales_rep || []).filter(p => p.module !== 'Product Leads'),
        { module: 'Product Leads', read: 'Assigned Only', write: 'No', delete: 'No' }
      ]
    };
    
    const visibleAssignedUnassigned = checkLeadVisibility(mockWebsiteLead, salesRepUser, tempPermissionsAssigned);
    console.log(`When Sales Rep Product Leads Read Scope is 'Assigned Only' (and lead is unassigned):`);
    console.log(`-> Sales Rep Visibility: ${visibleAssignedUnassigned ? '✅ VISIBLE' : '❌ HIDDEN'} (Expected: HIDDEN)`);

    // Check when permission is Assigned Only (lead IS assigned)
    const mockWebsiteLeadAssigned = {
      ...mockWebsiteLead,
      assigned_to: salesRepUser.id
    };
    const visibleAssignedAndAssigned = checkLeadVisibility(mockWebsiteLeadAssigned, salesRepUser, tempPermissionsAssigned);
    console.log(`When Sales Rep Product Leads Read Scope is 'Assigned Only' (and lead is assigned to Sales Rep):`);
    console.log(`-> Sales Rep Visibility: ${visibleAssignedAndAssigned ? '✅ VISIBLE' : '❌ HIDDEN'} (Expected: VISIBLE)`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
