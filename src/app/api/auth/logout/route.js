import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (refreshToken && supabase) {
      const { error } = await supabase
        .from('active_sessions')
        .update({ is_revoked: true })
        .eq('refresh_token', refreshToken);
      if (error) {
        console.error('Failed to revoke session on logout:', error);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear session cookie immediately
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Set expiry date to epoch (deletes cookie)
      path: '/',
    });

    // Clear refresh token cookie immediately
    response.cookies.set({
      name: 'refresh_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Set expiry date to epoch (deletes cookie)
      path: '/api/auth/refresh',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error during logout.' },
      { status: 500 }
    );
  }
}
