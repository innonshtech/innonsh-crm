import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tenant/settings
 * Returns the preferences from the organizations table.
 */
export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    let leadInactivityDays = 7;
    let followUpOverdueDays = 0;

    if (supabase) {
      const { data: org, error } = await supabase
        .from('organizations')
        .select('custom_terminology')
        .eq('id', user.orgId)
        .maybeSingle();

      if (error) throw error;

      if (org && org.custom_terminology) {
        leadInactivityDays = org.custom_terminology.leadInactivityDays !== undefined 
          ? Number(org.custom_terminology.leadInactivityDays) 
          : 7;
        followUpOverdueDays = org.custom_terminology.followUpOverdueDays !== undefined 
          ? Number(org.custom_terminology.followUpOverdueDays) 
          : 0;
      }
    }

    return NextResponse.json({
      success: true,
      settings: {
        leadInactivityDays,
        followUpOverdueDays
      }
    });
  } catch (err) {
    console.error('GET tenant settings error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 * PUT /api/tenant/settings
 * Updates preferences (restricted to owner role).
 */
export async function PUT(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    if (user.role !== 'owner') {
      return NextResponse.json({ error: 'Only organization owners can modify settings.' }, { status: 403 });
    }

    const { leadInactivityDays, followUpOverdueDays } = await req.json();

    const cleanLeadInactivityDays = Number(leadInactivityDays) >= 0 ? Number(leadInactivityDays) : 7;
    const cleanFollowUpOverdueDays = Number(followUpOverdueDays) >= 0 ? Number(followUpOverdueDays) : 0;

    if (supabase) {
      // First get current terminology so we don't wipe out other properties if any
      const { data: org } = await supabase
        .from('organizations')
        .select('custom_terminology')
        .eq('id', user.orgId)
        .maybeSingle();

      const currentTerminology = org?.custom_terminology || {};
      const newTerminology = {
        ...currentTerminology,
        leadInactivityDays: cleanLeadInactivityDays,
        followUpOverdueDays: cleanFollowUpOverdueDays
      };

      const { error } = await supabase
        .from('organizations')
        .update({ custom_terminology: newTerminology })
        .eq('id', user.orgId);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      settings: {
        leadInactivityDays: cleanLeadInactivityDays,
        followUpOverdueDays: cleanFollowUpOverdueDays
      }
    });
  } catch (err) {
    console.error('PUT tenant settings error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
