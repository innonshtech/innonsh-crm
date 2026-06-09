import { supabase } from '@/lib/supabaseClient';
import { signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided.' }, { status: 401 });
    }

    // 1. Verify the JWT structure of the refresh token
    const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    let payload;
    try {
      const verified = await jwtVerify(refreshToken, secret);
      payload = verified.payload;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired refresh token.' }, { status: 401 });
    }

    const userId = payload.id;

    // 2. Validate against the database session (prevent revoked tokens)
    if (supabase) {
      const { data: session, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('refresh_token', refreshToken)
        .eq('is_revoked', false)
        .maybeSingle();

      if (error || !session) {
        return NextResponse.json({ error: 'Session has been revoked or does not exist.' }, { status: 401 });
      }

      // Update last active time
      await supabase
        .from('active_sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', session.id);

      // Fetch latest user info to bake into new access token
      const { data: user } = await supabase
        .from('users')
        .select('id, name, email, role, org_id, is_super_admin, is_active')
        .eq('id', userId)
        .single();

      if (!user || !user.is_active) {
        return NextResponse.json({ error: 'User is inactive or deleted.' }, { status: 401 });
      }

      // 3. Issue new short-lived access token
      const sessionToken = signToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.org_id,
        isSuperAdmin: user.is_super_admin || user.role === 'superadmin',
      });

      const response = NextResponse.json({ success: true, message: 'Token refreshed successfully.' });

      response.cookies.set({
        name: 'token',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Database provider not supported for sessions yet.' }, { status: 501 });
  } catch (err) {
    console.error('Token refresh error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
