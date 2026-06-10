import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { supabase } from '@/lib/supabaseClient';
import { mapUserToFrontend } from '@/lib/dbMapper';
import { comparePassword, signToken, signRefreshToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { schemas, validate } from '@/lib/validators';

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = validate(schemas.login, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
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
    let userIsSuperAdmin = false;
    let userOrgApprovalStatus = 'Approved';
    let userCompanyName = '';
    let userOrgId = null;
    let userEnabledModules = ['leads', 'deals', 'contacts', 'tasks', 'emails', 'calls', 'meetings', 'products', 'quotations', 'invoices', 'reports', 'analytics', 'users', 'roles', 'teams', 'real-estate'];

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
        userIsSuperAdmin = data.is_super_admin || data.role === 'superadmin';
        userOrgId = data.org_id;

        // Check organization approval status if not a super admin
        if (data.org_id && !data.is_super_admin) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('name, approval_status, enabled_modules')
            .eq('id', data.org_id)
            .maybeSingle();
          if (orgError) {
            console.error('Supabase organization fetch error:', orgError);
          } else if (orgData) {
            userOrgApprovalStatus = orgData.approval_status;
            userCompanyName = orgData.name;
            userEnabledModules = orgData.enabled_modules || [];
          }
        }
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
        userIsSuperAdmin = mongoUser.isSuperAdmin || mongoUser.role === 'superadmin';
        userOrgId = mongoUser.orgId || mongoUser.org_id || null;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check organization approval status
    if (userOrgApprovalStatus === 'Pending') {
      return NextResponse.json(
        { error: '🔒 Your company registration is currently pending Super Admin approval. Please check back later.' },
        { status: 403 }
      );
    }

    if (userOrgApprovalStatus === 'Suspended') {
      return NextResponse.json(
        { error: '❌ Your company access has been suspended. Please contact support.' },
        { status: 403 }
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

    // 3. Create session token (JWT) and refresh token
    if (userIsSuperAdmin && !userEnabledModules.includes('real-estate')) {
      userEnabledModules.push('real-estate');
    }
    const sessionToken = signToken({
      id: userId,
      name: userName,
      email: userEmail,
      role: userRole,
      isSuperAdmin: userIsSuperAdmin,
      orgId: userOrgId,
      enabledModules: userEnabledModules,
    });

    const refreshToken = signRefreshToken({ id: userId });

    // Extract IP and User Agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    // Insert active session in Supabase database
    if (supabase) {
      const { error: sessionError } = await supabase
        .from('active_sessions')
        .insert([{
          user_id: userId,
          refresh_token: refreshToken,
          ip_address: ip.split(',')[0].trim(),
          user_agent: userAgent,
          is_revoked: false
        }]);
      if (sessionError) {
        console.error('Supabase session insert error:', sessionError);
      }
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
        companyName: userCompanyName,
        isSuperAdmin: userIsSuperAdmin,
        orgId: userOrgId,
        enabledModules: userEnabledModules,
      },
    });

    // Save access token as HTTP-Only cookie, valid for 15 minutes
    response.cookies.set({
      name: 'token',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    // Save refresh token as HTTP-Only cookie, valid for 7 days
    response.cookies.set({
      name: 'refresh_token',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/api/auth/refresh',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
