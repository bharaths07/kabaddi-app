import { createClient } from '@supabase/supabase-js'

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env

function notConfigured(): never {
  throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

const fallbackClient = {
  from: () => notConfigured(),
  auth: {
    getUser: () => notConfigured(),
    getSession: () => notConfigured(),
  },
  storage: {
    from: () => notConfigured(),
  },
  channel: () => notConfigured(),
  removeChannel: () => {},
  functions: {
    invoke: () => notConfigured(),
  },
} as any

export const supabase = VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY
  ? createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  : fallbackClient

try {
  if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  }
} catch {}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}
