import connectToDatabase from '@/lib/db';
import Contact from '@/lib/models/Contact';
import ClientOrganization from '@/lib/models/ClientOrganization';
import { supabase } from '@/lib/supabaseClient';

/**
 * Automator to ensure a permanent contact record exists for any qualified lead.
 * Does not create duplicates (checks lead_id / leadId first).
 */
export async function ensureContactForLead(lead, decodedUserOrId = null) {
  try {
    if (!lead) return null;

    // Check if the lead is Qualified (case insensitive check just in case, but standard is 'Qualified')
    const status = lead.status || lead.Status;
    if (status !== 'Qualified') {
      return null;
    }

    const leadId = lead.id || lead._id;
    if (!leadId) return null;

    let assigneeId = null;

    if (supabase) {
      // 1. SUPABASE FLOW
      // Check if contact already exists
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('id')
        .eq('lead_id', leadId)
        .maybeSingle();

      if (checkError) {
        console.error('Supabase check existing contact error:', checkError);
      }

      if (existingContact) {
        return existingContact;
      }

      // Determine assignee
      assigneeId = lead.assigned_to || (typeof decodedUserOrId === 'object' && decodedUserOrId ? decodedUserOrId.id : decodedUserOrId) || lead.created_by;

      // Find or create Client Organization in Supabase
      let organizationId = null;
      if (lead.company && lead.company.trim()) {
        const companyName = lead.company.trim();
        const { data: existingOrg, error: orgFindError } = await supabase
          .from('client_organizations')
          .select('id')
          .eq('org_id', lead.org_id)
          .ilike('name', companyName)
          .maybeSingle();

        if (existingOrg) {
          organizationId = existingOrg.id;
        } else {
          const { data: newOrg, error: orgCreateError } = await supabase
            .from('client_organizations')
            .insert([
              {
                org_id: lead.org_id,
                name: companyName,
                city: lead.city || '',
                state: lead.state || '',
                country: lead.country || 'India',
                assigned_to: assigneeId,
                custom_data: lead.custom_data || {}
              }
            ])
            .select('id')
            .single();

          if (newOrg) {
            organizationId = newOrg.id;
          }
        }
      }

      // Insert contact
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert([
          {
            first_name: lead.first_name,
            last_name: lead.last_name || '',
            company: lead.company,
            designation: lead.designation || '',
            email: lead.email || '',
            phone: lead.phone || '',
            whatsapp: lead.whatsapp || '',
            city: lead.city || '',
            state: lead.state || '',
            country: lead.country || 'India',
            organization_id: organizationId,
            assigned_to: assigneeId,
            lead_id: leadId,
            status: 'Active',
            custom_data: lead.custom_data || {},
            org_id: lead.org_id
          }
        ])
        .select('*')
        .single();

      if (contactError) {
        console.error('Supabase contact auto-creation error:', contactError);
        throw contactError;
      }

      return newContact;

    } else {
      // 2. MONGOOSE FLOW
      await connectToDatabase();

      // Check if contact already exists
      const existingContact = await Contact.findOne({ leadId });
      if (existingContact) {
        return existingContact;
      }

      // Determine assignee
      assigneeId = lead.assignedTo || (typeof decodedUserOrId === 'object' && decodedUserOrId ? decodedUserOrId.id : decodedUserOrId) || lead.createdBy;

      // Find or create Client Organization
      let organizationId = null;
      if (lead.company && lead.company.trim()) {
        const companyName = lead.company.trim();
        let existingOrg = await ClientOrganization.findOne({
          orgId: lead.orgId,
          name: { $regex: new RegExp(`^${companyName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
        });

        if (existingOrg) {
          organizationId = existingOrg._id;
        } else {
          const customFieldsData = {};
          if (lead.customFields && Array.isArray(lead.customFields)) {
            lead.customFields.forEach(f => {
              customFieldsData[f.label] = f.value;
            });
          }
          const newOrg = await ClientOrganization.create({
            orgId: lead.orgId,
            name: companyName,
            city: lead.city || '',
            state: lead.state || '',
            country: lead.country || 'India',
            assignedTo: assigneeId,
            customData: customFieldsData
          });
          organizationId = newOrg._id;
        }
      }

      // Create contact
      const newContact = await Contact.create({
        firstName: lead.firstName,
        lastName: lead.lastName || '',
        company: lead.company,
        designation: lead.designation || '',
        email: lead.email || '',
        phone: lead.phone || '',
        whatsapp: lead.whatsapp || '',
        city: lead.city || '',
        state: lead.state || '',
        country: lead.country || 'India',
        organizationId: organizationId,
        assignedTo: assigneeId,
        leadId: leadId,
        status: 'Active',
        orgId: lead.orgId
      });

      return newContact;
    }
  } catch (err) {
    console.error('ensureContactForLead automation failed:', err);
    return null;
  }
}
