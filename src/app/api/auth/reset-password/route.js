import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { supabase } from '@/lib/supabaseClient';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address syntax.').toLowerCase().trim(),
  otpCode: z.string().min(1, 'Verification code is required').trim(),
  newPassword: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.')
});

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email: cleanEmail, otpCode: cleanOtp, newPassword } = parsed.data;

    let user = null;
    let userId = null;
    let userOtpCode = null;
    let userOtpExpiry = null;

    // Hash the new password securely
    const hashedPassword = await hashPassword(newPassword);

    // DYNAMIC DATABASE DETECTOR
    if (supabase) {
      // 1. Retrieve the user from Supabase
      const { data: supabaseUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (fetchError) {
        console.error('Supabase user fetch error:', fetchError);
        return NextResponse.json({ error: 'Database verification failed.' }, { status: 500 });
      }

      if (supabaseUser) {
        user = supabaseUser;
        userId = supabaseUser.id;
        userOtpCode = supabaseUser.otp_code;
        userOtpExpiry = supabaseUser.otp_expiry;
      }
    } else {
      // Graceful fallback to MongoDB
      await connectToDatabase();
      const mongoUser = await User.findOne({ email: cleanEmail });

      if (mongoUser) {
        user = mongoUser;
        userId = mongoUser._id;
        userOtpCode = mongoUser.otpCode;
        userOtpExpiry = mongoUser.otpExpiry;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'No employee account found with this email.' }, { status: 404 });
    }

    // 2. Validate OTP code and expiry
    if (!userOtpCode || userOtpCode !== cleanOtp) {
      return NextResponse.json({ error: 'Invalid verification code. Please check and try again.' }, { status: 400 });
    }

    const expiryTime = new Date(userOtpExpiry);
    if (isNaN(expiryTime.getTime()) || expiryTime < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new OTP.' }, { status: 400 });
    }

    // 4. Update the user password and clear OTP fields
    if (supabase) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          otp_code: null,
          otp_expiry: null
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Supabase password update error:', updateError);
        return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
      }
    } else {
      await connectToDatabase();
      const mongoUser = await User.findById(userId);
      if (mongoUser) {
        mongoUser.password = hashedPassword;
        mongoUser.otpCode = null;
        mongoUser.otpExpiry = null;
        await mongoUser.save();
      } else {
        return NextResponse.json({ error: 'Failed to find employee account for updating password.' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset! You can now sign in with your new credentials.'
    });

  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json({ error: 'Internal server error during password reset.' }, { status: 500 });
  }
}
