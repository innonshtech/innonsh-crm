import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/auth/sessions
// Fetch all active sessions for the current user
export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { data, error } = await supabase
      .from('active_sessions')
      .select('id, ip_address, user_agent, created_at, last_active_at, is_revoked')
      .eq('user_id', user.id)
      .eq('is_revoked', false)
      .order('last_active_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, sessions: data || [] });
  } catch (err) {
    console.error('Fetch sessions error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// DELETE /api/auth/sessions?id=<sessionId>
// Revoke a specific session
export async function DELETE(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('active_sessions')
      .update({ is_revoked: true })
      .eq('id', sessionId)
      .eq('user_id', user.id); // Ensure they can only revoke their own

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Session revoked successfully.' });
  } catch (err) {
    console.error('Revoke session error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
