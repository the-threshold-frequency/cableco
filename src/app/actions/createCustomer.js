'use server';

import { createClient } from '@supabase/supabase-js';

export async function createCustomerAction(formData) {
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

  const fullName = formData.get('full_name');
  const mobileNumber = formData.get('mobile_number');
  const vcNumber = formData.get('vc_number');
  const customerId = formData.get('customer_id');
  const address = formData.get('address');
  let email = formData.get('email');

  // 1. Handle Missing Email
  // If no email is provided, we generate a placeholder.
  // We append a timestamp to ensure uniqueness in the Auth system,
  // allowing multiple accounts with the same phone number if necessary (e.g. family members or testing).
  if (!email || email.trim() === '') {
    const uniqueSuffix = Date.now().toString().slice(-5);
    email = `${mobileNumber}-${uniqueSuffix}@cableco.local`;
  }

  // 2. Generate Random Password
  const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

  try {
    // 3. Create Auth User
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: mobileNumber,
        address: address,
        vc_number: vcNumber,
        customer_id: customerId,
        role: 'customer'
      }
    });

    if (error) throw error;

    return { success: true, message: 'Customer created successfully.' };
  } catch (error) {
    console.error('Create Customer Error:', error);
    
    // FIX: Catch duplicate error and return friendly message
    if (error.message?.includes('already been registered')) {
        return { 
            success: false, 
            message: 'A customer with this Email already exists. Try entering a unique email.' 
        };
    }

    return { success: false, message: error.message };
  }
}