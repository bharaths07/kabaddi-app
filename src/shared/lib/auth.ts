import { supabase } from './supabase'

function normalizeAuthError(error: any): never {
  const message = String(error?.message || '')
  if (/Database error saving new user/i.test(message)) {
    throw new Error(
      'Database setup issue in Supabase Auth trigger. Run the updated src/supabase/schema.sql in Supabase SQL Editor, then retry.'
    )
  }
  throw error
}

// ── Phone OTP ─────────────────────────────────────────────────────
export async function sendPhoneOTP(phone: string) {
  const { error } = await supabase.auth.signInWithOtp({ phone })
  if (error) normalizeAuthError(error)
  return { ok: true as const }
}

export async function verifyPhoneOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone, token, type: 'sms',
  })
  if (error) throw error
  return data
}

// ── Email ─────────────────────────────────────────────────────────
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) normalizeAuthError(error)
  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

// ── Google ────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) throw error
  return { ok: true as const }
}

// ── Sign out ──────────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ── Profile ───────────────────────────────────────────────────────
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createOrUpdateProfile(userId: string, data: {
  full_name?: string
  phone?: string
  email?: string
  city?: string
  state?: string
  avatar_url?: string
  date_of_birth?: string
  is_profile_complete?: boolean
}) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    ...data,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
  return { ok: true as const }
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('user-avatars')
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('user-avatars').getPublicUrl(path)
  return data.publicUrl
}

export async function autoAssignScorer(fixtureId: string, userId: string) {
  const { error } = await supabase.from('fixture_scorers').upsert(
    { fixture_id: fixtureId, user_id: userId, assigned_at: new Date().toISOString() },
    { onConflict: 'fixture_id' }
  )
  if (error) throw error
}

// kept for backward compatibility
export function getDevAuthUser() { return null }
