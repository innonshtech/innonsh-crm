import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tenant/roles-permissions
 * Returns the roles_permissions configuration for the user's organization.
 */
export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    if (!supabase) {
      return NextResponse.json({ success: true, rolesPermissions: {} });
    }

    if (user.orgId) {
      const { data, error } = await supabase
        .from('organizations')
        .select('roles_permissions')
        .eq('id', user.orgId)
        .maybeSingle();

      if (error) {
        console.error('Failed to fetch roles permissions from Supabase:', error);
        throw error;
      }

      return NextResponse.json({
        success: true,
        rolesPermissions: (data && data.roles_permissions) ? data.roles_permissions : {},
      });
    }

    return NextResponse.json({
      success: true,
      rolesPermissions: {},
    });
  } catch (err) {
    console.error('GET roles-permissions error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 * PUT /api/tenant/roles-permissions
 * Updates the roles_permissions configuration for the organization (restricted to owner role).
 * Body: { rolesPermissions }
 */
export async function PUT(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    if (user.role !== 'owner') {
      return NextResponse.json({ error: 'Only organization owners can modify roles permissions.' }, { status: 403 });
    }

    const { rolesPermissions } = await req.json();
    if (!rolesPermissions || typeof rolesPermissions !== 'object') {
      return NextResponse.json({ error: 'rolesPermissions must be an object.' }, { status: 400 });
    }

    if (supabase && user.orgId) {
      const { error } = await supabase
        .from('organizations')
        .update({ roles_permissions: rolesPermissions })
        .eq('id', user.orgId);

      if (error) {
        console.error('Failed to update roles permissions in Supabase:', error);
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      rolesPermissions,
    });
  } catch (err) {
    console.error('PUT roles-permissions error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
