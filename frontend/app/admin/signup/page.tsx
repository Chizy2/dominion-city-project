'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelpers } from '@/lib/supabase';

export default function AdminSignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if email domain is valid
  const isValidEmailDomain = email.length > 0 && email.toLowerCase().endsWith('@dcdirect.online');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!branch.trim()) {
      setError('Branch is required');
      setLoading(false);
      return;
    }

    // Validate email domain - only allow @dcdirect.online
    const allowedDomain = '@dcdirect.online';
    if (!email.toLowerCase().endsWith(allowedDomain.toLowerCase())) {
      setError(`Only email addresses from ${allowedDomain} are allowed to create admin accounts`);
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Include branch in the signup data
      const result = await authHelpers.signUp(email, password, name, branch);

      if (!result.success) {
        setError(result.message || 'Failed to create admin account');
        return;
      }

      setSuccess(true);
      
      // Show message about email confirmation
      // Don't redirect immediately - let user read the message
    } catch (err: any) {
      // Handle axios errors and other errors
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          err.error?.message ||
                          'Failed to create admin account. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold text-dominion-blue mb-4 sm:mb-6 text-center">
          Admin Sign Up
        </h2>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-4 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-semibold mb-2">Account created successfully!</p>
                <p className="text-sm mb-3">
                  We've sent a confirmation email to <strong>{email}</strong>. Please check your inbox and click the verification link to activate your account.
                </p>
                <p className="text-sm text-green-700">
                  After verifying your email, you can log in to access the admin dashboard.
                </p>
                <div className="mt-4">
                  <Link 
                    href="/admin/login"
                    className="inline-block bg-dominion-blue text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition text-sm"
                  >
                    Go to Login Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
              required
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="branch" className="block text-gray-700 font-semibold mb-2">
              Branch <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
              required
              placeholder="Branch name or location"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                email.length > 0 && !isValidEmailDomain
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-dominion-gold'
              }`}
              required
              placeholder="yourname@dcdirect.online"
            />
            {email.length > 0 && !isValidEmailDomain && (
              <p className="text-xs text-red-600 mt-1">
                Email must end with <span className="font-semibold">@dcdirect.online</span>
              </p>
            )}
            {isValidEmailDomain && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Valid email domain
              </p>
            )}
            {email.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Only email addresses from <span className="font-semibold">@dcdirect.online</span> are allowed
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
            <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-dominion-gold text-dominion-blue px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Creating account...' : success ? 'Account Created!' : 'Create Admin Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link href="/admin/login" className="text-dominion-blue hover:underline font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
