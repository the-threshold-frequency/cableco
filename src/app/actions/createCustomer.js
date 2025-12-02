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
  const customerId = formData.get('customer_id'); // <--- NEW FIELD
  const address = formData.get('address');
  let email = formData.get('email');

  if (!email || email.trim() === '') {
    email = `${mobileNumber}@cableco.local`;
  }

  const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: mobileNumber,
        address: address,
        vc_number: vcNumber,
        customer_id: customerId, // <--- PASS TO METADATA (Trigger picks this up)
        role: 'customer'
      }
    });

    if (error) throw error;

    return { success: true, message: 'Customer created successfully.' };
  } catch (error) {
    console.error('Create Customer Error:', error);
    return { success: false, message: error.message };
  }
}