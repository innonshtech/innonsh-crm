import { NextResponse } from 'next/server';
import Lead from '@/lib/models/Lead';
import { sendEmail } from '@/lib/mailer';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req) {
  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get('authorization');
    const apiKey = process.env.WEBSITE_API_KEY;

    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ success: false, message: 'Unauthorized request' }, { status: 401 });
    }

    // 2. Parse Payload
    const body = await req.json();
    const { service, companyName, name, email, phone, message, interestedProduct, employeeCount } = body;

    // Validate essential fields
    if (!name || !companyName) {
      return NextResponse.json({ success: false, message: 'Name and Company Name are required' }, { status: 400 });
    }

    // 3. Transform Payload for Lead Model
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    const finalProduct = interestedProduct || 'Innonsh Website';
    const empCountNum = employeeCount ? parseInt(employeeCount.split('-')[0].replace(/,/g, '').replace('+', '')) || 0 : 0;
    const reqText = message ? `Requested Service: ${service || 'N/A'}\n\nEmployee Count: ${employeeCount || 'N/A'}\n\nMessage: ${message}` : `Requested Service: ${service || 'N/A'}\nEmployee Count: ${employeeCount || 'N/A'}`;

    // 4. Fetch the main organization ID (associated with the owner user)
    let orgId = null;
    const { data: ownerUser } = await supabase
      .from('users')
      .select('org_id')
      .eq('role', 'owner')
      .limit(1)
      .maybeSingle();

    if (ownerUser && ownerUser.org_id) {
      orgId = ownerUser.org_id;
    } else {
      // Fallback to the first organization in the database
      const { data: firstOrg } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .maybeSingle();
      if (firstOrg) orgId = firstOrg.id;
    }

    const { data, error } = await supabase.from('leads').insert([{
      first_name: firstName,
      last_name: lastName,
      company: companyName,
      email: email || '',
      phone: phone || '',
      requirements: reqText,
      interested_product: finalProduct,
      employee_count: empCountNum,
      source: 'Website',
      status: 'New',
      priority: 'Hot',
      org_id: orgId
    }]).select('id').single();

    if (error) {
      console.error('Supabase website lead insert error:', error);
      throw error;
    }
    
    const leadId = data.id;

    // Add timeline note
    await supabase.from('lead_notes').insert([{
      lead_id: leadId,
      text: 'Lead captured from Website API Endpoint',
      created_by_name: 'System API'
    }]);

    // 6. Send Email Notification
    const emailSubject = `🔥 New ${finalProduct} Lead Received: ${companyName}`;
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>New Inquiry from Website</h2>
        <p>A new lead has been submitted and saved to the CRM.</p>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <th style="background-color: #f8fafc; text-align: left;">Field</th>
            <th style="background-color: #f8fafc; text-align: left;">Value</th>
          </tr>
          <tr>
            <td><strong>Product</strong></td>
            <td>${finalProduct}</td>
          </tr>
          <tr>
            <td><strong>Lead Source</strong></td>
            <td>Website</td>
          </tr>
          <tr>
            <td><strong>Service Required</strong></td>
            <td>${service || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Company</strong></td>
            <td>${companyName}</td>
          </tr>
          <tr>
            <td><strong>Employee Count</strong></td>
            <td>${employeeCount || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Name</strong></td>
            <td>${name}</td>
          </tr>
          <tr>
            <td><strong>Email</strong></td>
            <td>${email || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Phone</strong></td>
            <td>${phone || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Message</strong></td>
            <td>${message || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Timestamp</strong></td>
            <td>${new Date().toLocaleString()}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="${process.env.APP_URL || 'http://localhost:5000'}/dashboard/leads" style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">View in CRM</a>
        </p>
      </div>
    `;

    // Attempt to send email, but don't fail the request if email fails (lead is already saved)
    try {
      const officeEmail = process.env.SMTP_USER || 'office@innonsh.com'; 
      await sendEmail({
        toEmail: officeEmail,
        toName: 'Innonsh Sales',
        subject: emailSubject,
        html: emailHtml
      });
    } catch (emailErr) {
      console.error('Failed to send lead notification email:', emailErr);
    }

    return NextResponse.json({ success: true, message: 'Lead captured successfully', leadId }, { status: 201 });

  } catch (error) {
    console.error('CRM Lead Capture Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
