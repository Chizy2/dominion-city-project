import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ussoyjjlauhggwsezbhy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzc295ampsYXVoZ2d3c2V6Ymh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0OTc0NzIsImV4cCI6MjA3NzA3MzQ3Mn0.P1Q7PMw8UUDVqOvSuHhb9eAKEWXfCP2catl6nWgSXJ0';

// Create Supabase client for client-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get API URL (same logic as api.ts but without circular dependency)
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5051/api';
    }
    
    const protocol = window.location.protocol;
    // In production, API is typically on the same domain (e.g., dcdirect.online/api)
    // No port needed for production HTTPS
    return `${protocol}//${hostname}/api`;
  }
  
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    return 'http://localhost:5051/api';
  }
  
  throw new Error('NEXT_PUBLIC_API_URL environment variable must be set in production');
};

// Helper functions for authentication
export const authHelpers = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signUp(email: string, password: string, name?: string, branch?: string) {
    // Call backend API for signup (uses service role key)
    // Using axios directly to avoid circular dependency with api.ts
    try {
      const apiUrl = getApiUrl();
      const response = await axios.post(`${apiUrl}/auth/signup`, {
        email,
        password,
        name,
        branch,
      });
      return response.data;
    } catch (error: any) {
      // Re-throw with better error message
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
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

