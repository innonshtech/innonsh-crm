import { supabase } from '@/lib/supabaseClient';
import { signToken, signRefreshToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided.' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('FATAL: JWT_REFRESH_SECRET or JWT_SECRET environment variable is missing!');
    }
    const secret = new TextEncoder().encode(jwtSecret);
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
        .maybeSingle();

      if (error || !session) {
        return NextResponse.json({ error: 'Session has been revoked or does not exist.' }, { status: 401 });
      }

      // Reuse detection: If the session found is already revoked, it implies token reuse!
      if (session.is_revoked) {
        console.warn(`⚠️ Security Breach Alert: Reused refresh token detected for user ${userId}. Revoking all active sessions.`);
        
        // Revoke all user sessions
        await supabase
          .from('active_sessions')
          .update({ is_revoked: true })
          .eq('user_id', userId);

        const response = NextResponse.json({ error: 'Security breach detected. Sessions terminated.' }, { status: 401 });
        
        // Clear cookies
        response.cookies.set({
          name: 'token',
          value: '',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: new Date(0),
          path: '/',
        });
        response.cookies.set({
          name: 'refresh_token',
          value: '',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: new Date(0),
          path: '/api/auth/refresh',
        });

        return response;
      }

      // Fetch latest user info to bake into new access token
      const { data: user } = await supabase
        .from('users')
        .select('id, name, email, role, org_id, is_super_admin, is_active')
        .eq('id', userId)
        .single();

      if (!user || !user.is_active) {
        // Revoke this session too
        await supabase
          .from('active_sessions')
          .update({ is_revoked: true })
          .eq('id', session.id);
        return NextResponse.json({ error: 'User is inactive or deleted.' }, { status: 401 });
      }

      let userEnabledModules = ['leads', 'deals', 'contacts', 'tasks', 'emails', 'calls', 'meetings', 'products', 'quotations', 'invoices', 'reports', 'users', 'roles', 'teams', 'real-estate'];

      // Fetch organization details to get enabled modules
      if (user.org_id && !user.is_super_admin) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('enabled_modules')
          .eq('id', user.org_id)
          .maybeSingle();
        if (orgError) {
          console.error('Supabase organization fetch error in refresh:', orgError);
        } else if (orgData) {
          userEnabledModules = orgData.enabled_modules || [];
        }
      }

      if (user.is_super_admin && !userEnabledModules.includes('real-estate')) {
        userEnabledModules.push('real-estate');
      }

      // 3. Issue new short-lived access token and rotated refresh token
      const sessionToken = signToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.org_id,
        isSuperAdmin: user.is_super_admin || user.role === 'superadmin',
        enabledModules: userEnabledModules,
      });

      const newRefreshToken = signRefreshToken({ id: user.id });

      // Rotate token in the database
      const { error: rotateError } = await supabase
        .from('active_sessions')
        .update({
          refresh_token: newRefreshToken,
          last_active_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (rotateError) {
        console.error('Failed to rotate refresh token in database:', rotateError);
        throw rotateError;
      }

      const response = NextResponse.json({ success: true, message: 'Token refreshed successfully.' });

      response.cookies.set({
        name: 'token',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });

      response.cookies.set({
        name: 'refresh_token',
        value: newRefreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
        path: '/api/auth/refresh',
      });

      return response;
    }

    return NextResponse.json({ error: 'Database provider not supported for sessions yet.' }, { status: 501 });
  } catch (err) {
    console.error('Token refresh error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
