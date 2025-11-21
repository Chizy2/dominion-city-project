'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { authHelpers } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, businessesRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAll({ limit: 10 }),
      ]);
      setStats(statsRes.stats);
      setBusinesses(businessesRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Check if unauthorized
      if (error instanceof Error && error.message.includes('401')) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authHelpers.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dominion-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-dominion-blue shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-white hover:text-dominion-gold transition text-sm sm:text-base px-3 py-2 text-left sm:text-center"
              >
                View Site
              </button>
              <button
                onClick={() => router.push('/admin/businesses/add')}
                className="bg-dominion-gold text-dominion-blue px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition text-sm sm:text-base"
              >
                Add Business
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-gray-600 text-sm sm:text-lg mb-2">Total Businesses</h3>
              <p className="text-3xl sm:text-4xl font-bold text-dominion-blue">{stats.total}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-gray-600 text-sm sm:text-lg mb-2">Active Businesses</h3>
              <p className="text-3xl sm:text-4xl font-bold text-dominion-gold">{stats.active}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <h3 className="text-gray-600 text-sm sm:text-lg mb-2">Total Views</h3>
              <p className="text-3xl sm:text-4xl font-bold text-dominion-blue">{stats.totalViews}</p>
            </div>
          </div>
        )}

        {/* Recent Businesses */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-dominion-blue">Recent Businesses</h2>
            <button
              onClick={() => router.push('/admin/businesses')}
              className="text-dominion-gold hover:underline text-sm sm:text-base self-start sm:self-auto"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Category</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">City</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {businesses.map((business) => (
                      <tr key={business.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm sm:text-base font-medium text-gray-900">
                          <div className="flex flex-col">
                            <span>{business.name}</span>
                            <span className="text-xs text-gray-500 sm:hidden">{business.category}</span>
                            <span className="text-xs text-gray-500 md:hidden">{business.city}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm sm:text-base text-gray-700 hidden sm:table-cell">{business.category}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm sm:text-base text-gray-700 hidden md:table-cell">{business.city}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs sm:text-sm rounded ${
                              business.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {business.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-sm sm:text-base">
                          <button
                            onClick={() => router.push(`/admin/businesses/edit/${business.id}`)}
                            className="text-dominion-blue hover:text-dominion-gold"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
