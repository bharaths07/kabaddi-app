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
