import { createClient } from '@supabase/supabase-js'

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env

export const supabase = VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY
  ? createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  : ({} as any)
