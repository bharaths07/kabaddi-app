// Lightweight auth stubs to let the app run during UI development.
// Replace these with real Supabase auth calls when env is configured.

export async function sendPhoneOTP(_phone: string): Promise<{ ok: true }> {
  await delay(300);
  return { ok: true };
}

export async function verifyPhoneOTP(_phone: string, _otp: string): Promise<{ ok: true }> {
  await delay(300);
  return { ok: true };
}

export async function signInWithEmail(_email: string, _password?: string): Promise<{ ok: true }> {
  await delay(300);
  return { ok: true };
}

export async function signUpWithEmail(_email: string, _password?: string): Promise<{ ok: true }> {
  await delay(300);
  return { ok: true };
}

export async function signInWithGoogle(): Promise<{ ok: true; redirectTo?: string }> {
  await delay(200);
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
