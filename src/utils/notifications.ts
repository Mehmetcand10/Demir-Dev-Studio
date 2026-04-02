import { createClient } from './supabase/client';

export const notify = async (userId: string | null, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const supabase = createClient();
  
  const { error } = await supabase.from('notifications').insert({
    user_id: userId, // null if system-wide or broadcast
    title,
    message,
    type
  });
  
  if (error) console.error("Bildirim gönderilemedi:", error.message);
};
