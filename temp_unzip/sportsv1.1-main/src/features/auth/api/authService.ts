import { supabase } from '@/shared/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Helper to format phone number to E.164 (Standardize input)
const formatPhoneNumber = (phone: string): string => {
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s-()]/g, '');

  // Ensure it starts with '+'
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If it's a raw number without +, we assume the UI might have missed it, 
  // but for safety in E.164, we should expect the '+' to be passed or prepend it if we are sure.
  // Ideally, the UI sends "+919876543210".
  return `+${cleaned}`;
};

export const authService = {
  /**
   * Request OTP for a phone number.
   * Handles validation, formatting, and Supabase interaction.
   * 
   * @param phone - The phone number in E.164 format (e.g., +919876543210)
   */
  async requestOtp(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Input Validation
      if (!phone) {
        return { success: false, error: 'Phone number is required.' };
      }

      const formattedPhone = formatPhoneNumber(phone);

      // Regex for E.164 (Basic check: + followed by 10-15 digits)
      const e164Regex = /^\+[1-9]\d{1,14}$/;
      if (!e164Regex.test(formattedPhone)) {
        return { success: false, error: 'Invalid phone format. Please use international format (e.g., +919876543210).' };
      }

      // Specific check for India (+91) to catch common length errors
      if (formattedPhone.startsWith('+91') && formattedPhone.length !== 13) {
        return { success: false, error: 'Invalid Indian phone number. Must be +91 followed by 10 digits.' };
      }

      console.log(`[AuthService] Requesting OTP for: ${formattedPhone}`);

      // 2. Call Supabase
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      console.error('[AuthService] Request OTP Error:', error);

      // 3. Error Normalization
      const e = error as { message?: string };
      let message = e.message || 'Failed to send OTP.';

      // Map common Supabase errors to user-friendly messages
      if (message.includes('Signups not allowed')) {
        message = 'New registrations are currently disabled.';
      } else if (message.includes('Too many requests')) {
        message = 'Too many attempts. Please try again later.';
      } else if (message.includes('not a valid phone number')) {
        message = 'Invalid phone number. Please check the digits.';
      }

      return { success: false, error: message };
    }
  },

  /**
   * Verify the OTP token provided by the user.
   * 
   * @param phone - The phone number used for the request
   * @param token - The 6-digit OTP code
   */
  async verifyOtp(phone: string, token: string): Promise<{ success: boolean; session?: Session | null; user?: SupabaseUser | null; error?: string }> {
    try {
      // 1. Input Validation
      if (!token || token.trim().length !== 6) {
        return { success: false, error: 'Please enter a valid 6-digit OTP.' };
      }

      const formattedPhone = formatPhoneNumber(phone);

      console.log(`[AuthService] Verifying OTP for: ${formattedPhone}`);

      // 2. Call Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
      });

      if (error) throw error;

      return {
        success: true,
        session: data.session,
        user: data.user
      };
    } catch (error: unknown) {
      console.error('[AuthService] Verify OTP Error:', error);

      // 3. Error Normalization
      const e = error as { message?: string };
      let message = e.message || 'Verification failed.';

      if (message.includes('Token has expired')) {
        message = 'OTP has expired. Please request a new one.';
      } else if (message.includes('invalid')) {
        message = 'Invalid OTP. Please check the code and try again.';
      }

      return { success: false, error: message };
    }
  },

  /**
   * Sign out the current authenticated user.
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: unknown) {
      console.error('[AuthService] SignOut Error:', error);
      const e = error as { message?: string };
      return { success: false, error: e.message };
    }
  },

  /**
   * Get the current active session.
   */
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Get the current authenticated user.
   */
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};
