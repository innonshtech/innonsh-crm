import { verifyToken, signToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { supabase } from '@/lib/supabaseClient';
import { mapUserToFrontend } from '@/lib/dbMapper';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => c.trim().split('='))
    );
    
    const refreshToken = cookies['refresh_token'];

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided.' }, { status: 401 });
    }

    const decoded = verifyToken(refreshToken);

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid or expired refresh token.' }, { status: 401 });
    }

    let user = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .maybeSingle();

      if (data) user = mapUserToFrontend(data);
    } else {
      await connectToDatabase();
      user = await User.findById(decoded.id);
    }

    if (!user || !user.isActive || user.approvalStatus === 'Pending') {
      return NextResponse.json({ error: 'User is inactive or pending approval.' }, { status: 403 });
    }

    // Generate new access token
    const newSessionToken = signToken({
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully.',
    });

    response.cookies.set({
      name: 'token',
      value: newSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Internal server error during token refresh.' }, { status: 500 });
  }
}
