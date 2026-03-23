import { supabase } from '../lib/supabase'

export type Theme = 'dark' | 'light'
export type Settings = {
  theme: Theme
  newsRefreshMs: number
  showLiveHints: boolean
  notifications: {
    push: boolean
    email: boolean
    sms: boolean
  }
  privacy: {
    publicProfile: boolean
    showHistory: boolean
  }
}

const KEY = 'gl.settings'

const DEFAULTS: Settings = {
  theme: 'dark',
  newsRefreshMs: 2000,
  showLiveHints: true,
  notifications: {
    push: true,
    email: false,
    sms: false
  },
  privacy: {
    publicProfile: true,
    showHistory: true
  }
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

export async function syncSettingsToSupabase(userId: string) {
  const settings = getSettings()
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ settings })
      .eq('id', userId)
    
    // PGRST204 means column is missing. Log it once but don't throw.
    if (error && error.code !== 'PGRST204') throw error
    if (error && error.code === 'PGRST204') {
      console.warn('Supabase profiles table is missing "settings" column. Settings will only be stored locally.')
    }
  } catch (err) {
    console.error('Failed to sync settings to Supabase:', err)
  }
}

export async function loadSettingsFromSupabase(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST204') throw error
    if (data?.settings) {
      updateSettings(data.settings)
    }
  } catch (err) {
    console.error('Failed to load settings from Supabase:', err)
  }
}

export function applyThemeClass(el: HTMLElement) {
  const s = getSettings()
  const cls = s.theme === 'light' ? 'theme-light' : ''
  if (cls) el.classList.add(cls)
  else el.classList.remove('theme-light')
}
