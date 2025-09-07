import { createClient } from '@supabase/supabase-js';

// Создаем клиент Supabase для клиентской части
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Клиент для клиентской части (с anon ключом)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Клиент для серверной части (с service role ключом)
export const supabaseAdmin = createClient(
  supabaseUrl, 
  process.env.SUPABASE_SERVICE_ROLE || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);