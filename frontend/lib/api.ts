import axios from 'axios';
import { supabase } from './supabase';

// Use production API URL - should be set via environment variable in production
// IMPORTANT: Set NEXT_PUBLIC_API_URL in production environment variables
const getApiUrl = () => {
  // Priority 1: Environment variable (REQUIRED in production)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Priority 2: In browser, use localhost for development
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If we're on localhost, use localhost API
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5051/api';
    }
    
    // For production domains (like dcdirect.online), construct API URL from current origin
    const protocol = window.location.protocol;
    // In production, API is typically on the same domain (e.g., dcdirect.online/api)
    // No port needed for production HTTPS
    return `${protocol}//${hostname}/api`;
  }
  
  // Priority 3: Check NODE_ENV for development (server-side)
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    return 'http://localhost:5051/api';
  }
  
  // Default: Throw error if no API URL is configured
  throw new Error('NEXT_PUBLIC_API_URL environment variable must be set in production');
};

// Create axios instance - baseURL will be set dynamically by interceptor
// We use a placeholder that will be replaced on each request
const api = axios.create({
  baseURL: '', // Will be set by interceptor on each request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to set the correct baseURL dynamically on each request
// This runs first, before the auth interceptor
api.interceptors.request.use((config) => {
  // Get the correct API URL (this will work correctly in browser)
  const apiUrl = getApiUrl();
  
  // CRITICAL: Always set the baseURL to the correct API URL
  // This ensures it's correct even if the module was loaded during SSR
  config.baseURL = apiUrl;
  
  // Ensure the final URL is correct
  // If config.url is relative, it will be combined with baseURL
  // If config.url is absolute, baseURL will be ignored (which is fine)
  if (config.url && !config.url.startsWith('http')) {
    // Relative URL - will use baseURL
    config.url = config.url.startsWith('/') ? config.url : '/' + config.url;
  }
  
  // Debug logging
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const hostname = window.location.hostname;
    const finalUrl = config.url?.startsWith('http') 
      ? config.url 
      : apiUrl + (config.url || '');
    console.log('[API] Using API URL:', apiUrl);
    console.log('[API] Final request URL:', finalUrl);
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add Supabase auth token to requests
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    // Get current Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return config;
});

// Handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        // Try to refresh session
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (!refreshError && session) {
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return api(originalRequest);
        } else {
          // Session expired, redirect to login
          await supabase.auth.signOut();
          window.location.href = '/admin/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const businessesAPI = {
  getAll: async (params?: {
    search?: string;
    category?: string;
    city?: string;
    state?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      const apiUrl = getApiUrl();
      console.log('Fetching businesses from:', apiUrl + '/businesses');
      console.log('With params:', params);
      const response = await api.get('/businesses', { params });
      console.log('Businesses API response:', {
        success: response.data.success,
        count: response.data.count,
        dataLength: response.data.data?.length || 0
      });
      
      if (!response.data.success) {
        console.warn('API returned success=false:', response.data);
      }
      
      if (!response.data.data || response.data.data.length === 0) {
        console.warn('No businesses returned from API');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching businesses:', error);
      const apiUrl = getApiUrl();
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url || apiUrl + '/businesses',
        baseURL: apiUrl,
      });
      
      // Return empty data structure to prevent crashes
      return {
        success: false,
        data: [],
        count: 0,
        error: error.message
      };
    }
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/businesses/${id}`);
    return response.data;
  },
  
  getFeatured: async () => {
    try {
      const response = await api.get('/businesses/featured/list');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching featured businesses:', error);
      return { success: false, data: [] };
    }
  },
  
  getCategories: async () => {
    try {
      const response = await api.get('/businesses/meta/categories');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return { success: false, data: [] };
    }
  },
  
  getCities: async () => {
    try {
      const response = await api.get('/businesses/meta/cities');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching cities:', error);
      return { success: false, data: [] };
    }
  },
};

export const adminAPI = {
  getAll: async (params?: {
    search?: string;
    category?: string;
    city?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/admin/businesses', { params });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
  
  create: async (formData: FormData) => {
    const response = await api.post('/admin/businesses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  update: async (id: string, formData: FormData) => {
    const response = await api.put(`/admin/businesses/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/admin/businesses/${id}`);
    return response.data;
  },
};

export default api;
