'use server';

import { createClient } from '@supabase/supabase-js';

export async function updateEmployeeAction(formData) {
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

  const { id, full_name, mobile_number } = formData;

  try {
    // 1. Update Auth User (Login Credentials)
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      phone: mobileNumber,
      // If you are using email as login too, you might need to update email here as well
      // email: mobileNumber + '@staff.cableco.in', 
      user_metadata: { 
        full_name: full_name, 
        mobile_number: mobileNumber, 
        phone: mobileNumber 
      }
    });

    if (authError) throw authError;

    // 2. Update Public Data Table (UI Data)
    const { error: dbError } = await supabase
      .from('users')
      .update({ 
        full_name: full_name, 
        mobile_number: mobileNumber 
      })
      .eq('id', id);

    if (dbError) throw dbError;

    return { success: true, message: 'Employee updated successfully.' };
  } catch (error) {
    console.error('Update Error:', error);
    return { success: false, message: error.message };
  }
}