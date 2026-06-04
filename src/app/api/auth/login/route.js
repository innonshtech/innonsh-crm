import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { supabase } from '@/lib/supabaseClient';
import { mapUserToFrontend } from '@/lib/dbMapper';
import { auditLog } from '@/lib/logger';
import { comparePassword, signToken, signRefreshToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address syntax.'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, password } = parsed.data;

    let user = null;
    let userId = null;
    let userName = null;
    let userEmail = null;
    let userRole = null;
    let userApprovalStatus = 'Approved';
    let userIsActive = true;
    let userHashedPassword = '';

    // 1. DYNAMIC DATABASE DETECTOR
    if (supabase) {
      // Query Supabase PostgreSQL
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (error) {
        console.error('Supabase user fetch error:', error);
      } else if (data) {
        user = mapUserToFrontend(data);
        userId = data.id;
        userName = data.name;
        userEmail = data.email;
        userRole = data.role;
        userApprovalStatus = data.approval_status;
        userIsActive = data.is_active;
        userHashedPassword = data.password;
      }
    } else {
      // Graceful fallback to MongoDB
      await connectToDatabase();
      const mongoUser = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
      if (mongoUser) {
        user = mongoUser;
        userId = mongoUser._id;
        userName = mongoUser.name;
        userEmail = mongoUser.email;
        userRole = mongoUser.role;
        userApprovalStatus = mongoUser.approvalStatus;
        userIsActive = mongoUser.isActive;
        userHashedPassword = mongoUser.password;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check approval moderation status
    if (userApprovalStatus === 'Pending') {
      return NextResponse.json(
        { error: '🔒 Your account registration is pending manager approval. Please check back later.' },
        { status: 403 }
      );
    }

    if (!userIsActive) {
      return NextResponse.json(
        { error: 'User account is deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // 2. Compare password hashes
    const isMatch = await comparePassword(password, userHashedPassword);

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 3. Create session tokens (JWT)
    const sessionToken = signToken({
      id: userId,
      name: userName,
      email: userEmail,
      role: userRole,
    });

    const refreshToken = signRefreshToken({ id: userId });

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown Device';

    // 3.5 Log the active session
    if (supabase) {
      // In Supabase, if we create a session table, we can insert it here.
      // For now we will rely on Supabase's built in tracking or assume a sessions table exists.
      try {
        await supabase.from('active_sessions').insert([{
          user_id: userId,
          refresh_token: refreshToken,
          ip_address: ipAddress,
          user_agent: userAgent
        }]);
      } catch (e) {
        console.warn('Could not insert session to Supabase', e);
      }
    } else {
      await connectToDatabase();
      await User.findByIdAndUpdate(userId, {
        $push: {
          activeSessions: {
            token: refreshToken,
            ipAddress,
            userAgent,
            lastActive: new Date()
          }
        }
      });
    }

    // 4. Create response and set cookies
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole,
      },
    });

    // Save access token as HTTP-Only cookie, valid for 15 minutes
    response.cookies.set({
      name: 'token',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes in seconds
      path: '/',
    });

    // Save refresh token as HTTP-Only cookie, valid for 7 days
    response.cookies.set({
      name: 'refresh_token',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/api/auth/refresh', // Restrict path for security
    });

    auditLog('USER_LOGIN_SUCCESS', userId, { email: userEmail, role: userRole, ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') });

    return response;
  } catch (error) {
    auditLog('USER_LOGIN_ERROR', 'system', { error: error.message, email: req.body?.email });
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
