export type Theme = 'dark' | 'light'
export type Settings = {
  theme: Theme
  newsRefreshMs: number
  showLiveHints: boolean
}

const KEY = 'gl.settings'

const DEFAULTS: Settings = {
  theme: 'dark',
  newsRefreshMs: 2000,
  showLiveHints: true
}

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) as Partial<Settings> : {}
    return { ...DEFAULTS, ...parsed }
  } catch {
    return { ...DEFAULTS }
  }
}

export function updateSettings(patch: Partial<Settings>) {
  const current = getSettings()
  const next = { ...current, ...patch }
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  dispatchEvent(new CustomEvent('settings:changed'))
}

export function applyThemeClass(el: HTMLElement) {
  const s = getSettings()
  const cls = s.theme === 'light' ? 'theme-light' : ''
  if (cls) el.classList.add(cls)
  else el.classList.remove('theme-light')
}
