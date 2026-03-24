import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
if (supabaseUrl && supabaseUrl.startsWith('/') && typeof window !== 'undefined') {
  supabaseUrl = window.location.origin + supabaseUrl;
}
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let client: any;

const dummyError = { data: null, error: new Error('Supabase keys are missing in Vercel! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.') };

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase not configured. Falling back to offline mock. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable backend.')
  client = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => {},
      signInWithOtp: async () => dummyError,
      signInWithPassword: async () => dummyError,
      signInWithOAuth: async () => dummyError,
      verifyOtp: async () => dummyError,
      signUp: async () => dummyError,
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      insert: () => ({ select: async () => ({ data: null, error: null }) })
    })
  }
} else {
  client = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = client

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}
