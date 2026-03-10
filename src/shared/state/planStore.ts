import { supabase } from '@shared/lib/supabase'

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
  const { data } = await supabase
    .from('users')
    .select('plan')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single()
  return (data?.plan as Plan) || 'free'
}

export async function upgradePlan(plan: Plan) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('users').update({ plan }).eq('id', user!.id)
}
