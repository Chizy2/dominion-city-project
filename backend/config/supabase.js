const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client for Auth and Storage
// Get from environment or construct from DATABASE_URL if available
let supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

// If DATABASE_URL is set, extract URL from it
if (!supabaseUrl && process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  const match = dbUrl.match(/@([^:]+):(\d+)\/(.+)/);
  if (match) {
    supabaseUrl = `https://${match[1]}`;
  }
}

// If still no URL, use the known project URL
if (!supabaseUrl) {
  supabaseUrl = 'https://ussoyjjlauhggwsezbhy.supabase.co';
}

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // For backend operations
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzc295ampsYXVoZ2d3c2V6Ymh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0OTc0NzIsImV4cCI6MjA3NzA3MzQ3Mn0.P1Q7PMw8UUDVqOvSuHhb9eAKEWXfCP2catl6nWgSXJ0';

if (!supabaseUrl) {
  console.warn('⚠️  Supabase URL not configured. Storage features may not work.');
}

// Use service role key for backend (bypasses RLS) if available, otherwise use anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseKey) {
  console.warn('⚠️  Supabase keys not configured. Storage features may not work.');
}

// Custom fetch with timeout for Node.js
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = 30000; // 30 seconds
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'dominion-city-backend'
    },
    // Use custom fetch with timeout in Node.js environment
    ...(typeof window === 'undefined' && { fetch: fetchWithTimeout })
  }
});

// For client-side operations (if needed)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabase, supabaseAnon };

