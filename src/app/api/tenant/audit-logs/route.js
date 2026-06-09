import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/tenant/audit-logs
export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    if (user.role !== 'owner' && !user.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden. Only Owners and Super Admins can view audit logs.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 100;

    let queryBuilder = supabase
      .from('audit_logs')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false })
      .limit(limit);

    // If not super admin, restrict to their org
    if (!user.isSuperAdmin && user.orgId) {
      queryBuilder = queryBuilder.eq('org_id', user.orgId);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;

    return NextResponse.json({ success: true, logs: data || [] });
  } catch (err) {
    console.error('Fetch audit logs error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
