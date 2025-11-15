'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, authHelpers } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const session = await authHelpers.getSession();
      if (session) {
        router.push('/admin/dashboard');
      }
    };
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/admin/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await authHelpers.signIn(email, password);

      if (authError) {
        setError(authError.message || 'Invalid credentials. Please try again.');
        return;
      }

      if (!data.session) {
        setError('Login failed. Please try again.');
        return;
      }

      // Check if user is admin (via user metadata)
      // Backend will also verify admin status on API calls
      const userMetadata = data.user?.user_metadata || {};
      const isAdmin = userMetadata.is_admin === true || userMetadata.is_admin === 'true';
      
      if (!isAdmin) {
        await authHelpers.signOut();
        setError('Access denied. Admin privileges required.');
        return;
      }

      // Session is automatically stored by Supabase client
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-dominion-blue mb-6 text-center">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dominion-gold text-dominion-blue px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Default credentials: admin@dominioncity.com / admin123
        </p>
      </div>
    </div>
  );
}
