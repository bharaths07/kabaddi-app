import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fwnzgvclfztemtpgeztr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bnpndmNsZnp0ZW10cGdlenRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzYwNzAsImV4cCI6MjA4ODcxMjA3MH0.5taNp43R55H42SkufV3uWg1fml0VujbH-bi1pRM3uIs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
