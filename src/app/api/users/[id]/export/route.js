import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { supabase } from '@/lib/supabaseClient';
import { getUserFromRequest } from '@/lib/auth';
import { auditLog } from '@/lib/logger';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const decodedUser = getUserFromRequest(req);

    if (!decodedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetUserId = params.id;

    // Users can only export their own data, unless they are admins.
    if (decodedUser.id !== targetUserId && !['owner', 'sales_admin'].includes(decodedUser.role)) {
      return NextResponse.json({ error: 'Forbidden. You can only export your own data.' }, { status: 403 });
    }

    let user = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: 'Database fetch error.' }, { status: 500 });
      }
      user = data;
    } else {
      await connectToDatabase();
      user = await User.findById(targetUserId).lean();
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Sanitize user output for export (remove passwords, otps, etc)
    const exportData = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approval_status: user.approval_status || user.approvalStatus,
      is_active: user.is_active || user.isActive,
      created_at: user.created_at || user.createdAt,
    };

    auditLog('USER_DATA_EXPORT', decodedUser.id, { targetUserId });

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user_export_${targetUserId}.json"`
      }
    });

  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json({ error: 'Internal server error during data export.' }, { status: 500 });
  }
}
