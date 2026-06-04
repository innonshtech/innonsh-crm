import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { supabase } from '@/lib/supabaseClient';
import { mapUserToFrontend } from '@/lib/dbMapper';
import { getUserFromRequest, hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auditLog } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/users - Fetch company user directory listing
export async function GET(req) {
  try {
    const decodedUser = getUserFromRequest(req);

    if (!decodedUser) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    // SECURITY CHECK: Only Owner and Sales Managers can view/assign to all company users
    if (decodedUser.role === 'sales_rep') {
      return NextResponse.json(
        { error: 'Forbidden. Sales representatives do not have access to the user directory.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const fetchAll = searchParams.get('all') === 'true';

    if (supabase) {
      let queryBuilder = supabase.from('users');

      if (fetchAll) {
        queryBuilder = queryBuilder.select('id, name, email, role, is_active, approval_status, created_at');

        // Hierarchical filter: Sales Managers strictly only view and manage Sales Representatives
        if (decodedUser.role === 'sales_admin') {
          queryBuilder = queryBuilder.eq('role', 'sales_rep');
        }

        const { data, error } = await queryBuilder.order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase fetch all users error:', error);
          throw error;
        }

        const users = (data || []).map(mapUserToFrontend);

        return NextResponse.json({
          success: true,
          count: users.length,
          users,
        });

      } else {
        queryBuilder = queryBuilder.select('id, name, email, role').eq('is_active', true);

        // Dropdown selection list filters: Sales Managers strictly assign to Sales Reps
        if (decodedUser.role === 'sales_admin') {
          queryBuilder = queryBuilder.eq('role', 'sales_rep');
        }

        const { data, error } = await queryBuilder.order('name', { ascending: true });

        if (error) {
          console.error('Supabase fetch active users error:', error);
          throw error;
        }

        const users = (data || []).map(mapUserToFrontend);

        return NextResponse.json({
          success: true,
          count: users.length,
          users,
        });
      }

    } else {
      await connectToDatabase();

      let users;
      if (fetchAll) {
        // Hierarchical filter: Sales Managers strictly only view and manage Sales Representatives
        const query = decodedUser.role === 'sales_admin' 
          ? { role: 'sales_rep' } 
          : {};

        users = await User.find(query)
          .select('_id name email role isActive approvalStatus createdAt')
          .sort({ createdAt: -1 });
      } else {
        // Dropdown selection list filters: Sales Managers strictly assign to Sales Reps
        const query = decodedUser.role === 'sales_admin'
          ? { isActive: true, role: 'sales_rep' }
          : { isActive: true };

        users = await User.find(query)
          .select('_id name email role')
          .sort({ name: 1 });
      }

      return NextResponse.json({
        success: true,
        count: users.length,
        users,
      });
    }
  } catch (error) {
    console.error('Fetch users directory error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching user list.' },
      { status: 500 }
    );
  }
}

// POST /api/users - Invite/Create a new employee profile securely
export async function POST(req) {
  try {
    const decodedUser = getUserFromRequest(req);

    if (!decodedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SECURITY CHECK: Only Owner and Sales Managers can create new user accounts
    if (decodedUser.role === 'sales_rep') {
      return NextResponse.json({ error: 'Forbidden. Access restricted to administrators.' }, { status: 403 });
    }

    const body = await req.json();
    const createUserSchema = z.object({
      name: z.string().min(1, 'Name is required').trim(),
      email: z.string().email('Invalid email address syntax.').toLowerCase().trim(),
      password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.'),
      role: z.enum(['sales_rep', 'sales_admin', 'owner'])
    });

    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;

    // Role-based privilege gates check: Managers cannot create Owner accounts
    if (decodedUser.role === 'sales_admin' && role === 'owner') {
      return NextResponse.json({ error: 'Forbidden: Sales Managers cannot create Owner accounts.' }, { status: 403 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (supabase) {
      // Check email duplication in database
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json({ error: 'An employee account with this email already exists.' }, { status: 400 });
      }

      // Hash the password securely using bcrypt
      const hashedPassword = await hashPassword(password);

      const userData = {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,
        is_active: true,
        approval_status: 'Approved' // Auto approved on creation by admin
      };

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([userData])
        .select('*')
        .single();

      if (insertError) {
        console.error('Supabase user insert error:', insertError);
        throw insertError;
      }

      auditLog('USER_CREATED', decodedUser.id, { createdUserId: newUser.id, createdUserEmail: newUser.email, role });

      return NextResponse.json({
        success: true,
        message: 'New representative profile registered successfully!',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });

    } else {
      await connectToDatabase();

      // Check email duplication in database
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return NextResponse.json({ error: 'An employee account with this email already exists.' }, { status: 400 });
      }

      // Hash the password securely using bcrypt
      const hashedPassword = await hashPassword(password);

      const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,
        isActive: true
      });

      auditLog('USER_CREATED', decodedUser.id, { createdUserId: newUser._id, createdUserEmail: newUser.email, role });

      return NextResponse.json({
        success: true,
        message: 'New representative profile registered successfully!',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    }
  } catch (error) {
    auditLog('USER_CREATE_ERROR', req.headers?.get?.('x-user-id') || 'system', { error: error.message });
    console.error('Create new user account error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
