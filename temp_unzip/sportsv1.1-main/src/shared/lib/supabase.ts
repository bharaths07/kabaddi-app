import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const forceMock = import.meta.env.VITE_SUPABASE_MOCK === 'true';

const isKeyInvalid = !supabaseKey || supabaseKey.includes('placeholder') || supabaseKey.includes('remove');
const isUrlInvalid = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl === 'https://your-project.supabase.co';
const isPlaceholder = forceMock || isUrlInvalid || isKeyInvalid;

// Startup diagnostics (no secrets logged)
{
  const mode = isPlaceholder ? 'MOCK' : 'REAL';
  console.log(`[Supabase] Mode: ${mode}, URL: ${supabaseUrl ?? 'undefined'}`);
}

// Mock Supabase Client for Development/Demo
const createMockClient = () => {
  console.warn('⚠️ Supabase is in MOCK mode. No actual network requests will be made.');

  const mockQueryBuilder = {
    select: () => mockQueryBuilder,
    insert: () => mockQueryBuilder,
    update: () => mockQueryBuilder,
    delete: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    neq: () => mockQueryBuilder,
    gt: () => mockQueryBuilder,
    lt: () => mockQueryBuilder,
    gte: () => mockQueryBuilder,
    lte: () => mockQueryBuilder,
    in: () => mockQueryBuilder,
    is: () => mockQueryBuilder,
    like: () => mockQueryBuilder,
    ilike: () => mockQueryBuilder,
    contains: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    limit: () => mockQueryBuilder,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: unknown) => (resolve as (value: { data: unknown[]; error: null }) => unknown)({ data: [], error: null }),
  };

  return {
    from: (table: string) => {
      console.log(`[MockSupabase] Querying table: ${table}`);
      return mockQueryBuilder;
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: { id: 'mock-user' }, session: {} }, error: null }),
      signInWithOtp: (params: unknown) => {
        console.log('[MockSupabase] signInWithOtp:', params);
        return Promise.resolve({ data: { user: null, session: null }, error: null });
      },
      verifyOtp: (params: unknown) => {
        console.log('[MockSupabase] verifyOtp:', params);
        const p = params as { token?: string; phone?: string };
        if (p.token === '123456') {
          return Promise.resolve({
            data: {
              user: { id: 'mock-user', phone: p.phone },
              session: { access_token: 'mock-token' }
            },
            error: null
          });
        }
        return Promise.resolve({ data: { user: null, session: null }, error: { message: 'Invalid OTP' } });
      },
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: { id: 'mock-user' } }, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://via.placeholder.com/150' } }),
      }),
    },
    rpc: () => Promise.resolve({ data: null, error: null }),
    channel: (name: string) => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => { } }) }),
      subscribe: () => ({ unsubscribe: () => { } }),
    }),
  };
};

// Export either the real client or the mock client
export const supabase: SupabaseClient = isPlaceholder
  ? (createMockClient() as unknown as SupabaseClient)
  : createClient(supabaseUrl!, supabaseKey!);
