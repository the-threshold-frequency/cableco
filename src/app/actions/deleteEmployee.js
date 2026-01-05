'use server';

import { createClient } from '@supabase/supabase-js';

export async function deleteEmployeeAction(userId) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Admin Key required to delete from Auth
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // 1. Delete the Auth User (This usually cascades to public.users automatically)
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;

    return { success: true, message: 'Employee deleted successfully.' };
  } catch (error) {
    console.error('Delete Error:', error);
    return { success: false, message: error.message };
  }
}