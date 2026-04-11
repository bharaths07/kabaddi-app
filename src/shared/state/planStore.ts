import { supabase } from '../lib/supabase'


export type Plan = 'free' | 'pro' | 'enterprise'

const KEY = 'gl.user.plan'

export function getPlan(): Plan {
  try {
    const raw = localStorage.getItem(KEY)
    const p = raw as Plan | null
    return p === 'pro' || p === 'enterprise' ? p : 'free'
  } catch { return 'free' }
}

export function setPlan(p: Plan) {
  try { localStorage.setItem(KEY, p) } catch {}
  dispatchEvent(new CustomEvent('plan:changed', { detail: p }))
}

export async function getUserPlan(): Promise<Plan> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'
  
  const { data } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()
    
  return (data?.subscription_tier as Plan) || 'free'
}

export async function upgradePlan(plan: Plan) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return;
  
  await supabase
    .from('profiles')
    .update({ 
      subscription_tier: plan,
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
}

