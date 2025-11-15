import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ussoyjjlauhggwsezbhy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzc295ampsYXVoZ2d3c2V6Ymh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0OTc0NzIsImV4cCI6MjA3NzA3MzQ3Mn0.P1Q7PMw8UUDVqOvSuHhb9eAKEWXfCP2catl6nWgSXJ0';

// Create Supabase client for client-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for authentication
export const authHelpers = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default supabase;

