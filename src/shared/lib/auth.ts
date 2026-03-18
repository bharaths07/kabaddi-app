// Lightweight auth stubs to let the app run during UI development.
// Replace these with real Supabase auth calls when env is configured.

type DevUser = {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    full_name?: string;
  };
};

const DEV_AUTH_KEY = 'pl.dev.user';

function readDevUser(): DevUser | null {
  try {
    const raw = localStorage.getItem(DEV_AUTH_KEY);
    return raw ? (JSON.parse(raw) as DevUser) : null;
  } catch {
    return null;
  }
}

function writeDevUser(user: DevUser | null) {
  try {
    if (!user) localStorage.removeItem(DEV_AUTH_KEY);
    else localStorage.setItem(DEV_AUTH_KEY, JSON.stringify(user));
  } catch {
    // ignore localStorage errors in constrained environments
  }
  try {
    dispatchEvent(new CustomEvent('auth:changed', { detail: user }));
  } catch {
    // no-op
  }
}

function mkDevUser(seed: string, data?: Partial<DevUser>): DevUser {
  const base = seed.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'user';
  return {
    id: `dev-${base}-${Date.now()}`,
    ...data,
  };
}

export function getDevAuthUser(): DevUser | null {
  return readDevUser();
}

export async function sendPhoneOTP(_phone: string): Promise<{ ok: true }> {
  await delay(300);
  return { ok: true };
}

export async function verifyPhoneOTP(phone: string, _otp: string): Promise<{ ok: true }> {
  await delay(300);
  const existing = readDevUser();
  writeDevUser(existing || mkDevUser(phone, { phone }));
  return { ok: true };
}

export async function signInWithEmail(email: string, _password?: string): Promise<{ ok: true }> {
  await delay(300);
  const existing = readDevUser();
  writeDevUser(existing || mkDevUser(email, { email }));
  return { ok: true };
}

export async function signUpWithEmail(email: string, _password?: string): Promise<{ ok: true }> {
  await delay(300);
  const existing = readDevUser();
  writeDevUser(existing || mkDevUser(email, { email }));
  return { ok: true };
}

export async function signInWithGoogle(): Promise<{ ok: true; redirectTo?: string }> {
  await delay(200);
  const existing = readDevUser();
  writeDevUser(existing || mkDevUser('google', {
    email: 'google.user@playlegends.dev',
    user_metadata: { full_name: 'Google User' },
  }));
  return { ok: true, redirectTo: '/auth/callback' };
}

export async function uploadAvatar(_userId: string, _file: File): Promise<string> {
  await delay(250);
  return '';
}

export async function createOrUpdateProfile(_userId: string, _data: any): Promise<{ ok: true }> {
  await delay(250);
  // mark as onboarded in local storage to control flow
  try { localStorage.setItem('pl.hasOnboarded', '1'); } catch {}
  return { ok: true };
}

function delay(ms: number) {
  return new Promise<void>(res => setTimeout(res, ms));
}
