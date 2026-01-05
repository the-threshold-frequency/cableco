'use server';

import { createClient } from '@supabase/supabase-js';

export async function createEmployeeAction(formData) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, 
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const fullName = formData.full_name;
  const mobileNumber = formData.mobile_number;
  const password = formData.password;
  // Email is optional now
  const email = formData.email && formData.email.trim() !== '' ? formData.email : undefined;

  try {
    // 1. Create Auth User (Using Phone as primary if Email is missing)
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,             // Can be undefined now
      phone: mobileNumber,      // Primary identifier if email is null
      password: password,
      email_confirm: true,
      phone_confirm: true,      // Auto-confirm the phone number
      user_metadata: {
        full_name: fullName,
        mobile_number: mobileNumber,
        phone: mobileNumber,
        role: 'employee'
      }
    });

    if (error) throw error;

    return { success: true, message: 'Employee created successfully.' };
  } catch (error) {
    console.error('Create Employee Error:', error);
    
    // Friendly error for duplicates
    if (error.message?.includes('already been registered') || error.message?.includes('unique constraint')) {
        return { 
            success: false, 
            message: 'An employee with this Phone Number already exists.' 
        };
    }

    return { success: false, message: error.message };
  }
}