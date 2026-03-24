import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase not configured. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}
