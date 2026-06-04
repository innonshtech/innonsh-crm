import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { supabase } from '@/lib/supabaseClient';
import { getUserFromRequest } from '@/lib/auth';
import { auditLog } from '@/lib/logger';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  try {
    const decodedUser = getUserFromRequest(req);

    if (!decodedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetUserId = params.id;

    // Only owner can delete accounts. A user cannot delete themselves (or maybe they can? Let's restrict to owner for CRM)
    if (decodedUser.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden. Only the CRM Owner can delete employee accounts.' }, { status: 403 });
    }

    if (decodedUser.id === targetUserId) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }

    if (supabase) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', targetUserId);

      if (error) {
        return NextResponse.json({ error: 'Database deletion failed.' }, { status: 500 });
      }
    } else {
      await connectToDatabase();
      const result = await User.findByIdAndDelete(targetUserId);
      if (!result) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      }
    }

    auditLog('USER_DELETED', decodedUser.id, { targetUserId });

    return NextResponse.json({ success: true, message: 'User account successfully deleted.' });

  } catch (error) {
    console.error('Data deletion error:', error);
    return NextResponse.json({ error: 'Internal server error during data deletion.' }, { status: 500 });
  }
}
