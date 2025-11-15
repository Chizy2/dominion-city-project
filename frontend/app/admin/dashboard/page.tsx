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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-white hover:text-dominion-gold transition"
              >
                View Site
              </button>
              <button
                onClick={() => router.push('/admin/businesses/add')}
                className="bg-dominion-gold text-dominion-blue px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Add Business
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-lg mb-2">Total Businesses</h3>
              <p className="text-4xl font-bold text-dominion-blue">{stats.total}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-lg mb-2">Active Businesses</h3>
              <p className="text-4xl font-bold text-dominion-gold">{stats.active}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-lg mb-2">Total Views</h3>
              <p className="text-4xl font-bold text-dominion-blue">{stats.totalViews}</p>
            </div>
          </div>
        )}

        {/* Recent Businesses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-dominion-blue">Recent Businesses</h2>
            <button
              onClick={() => router.push('/admin/businesses')}
              className="text-dominion-gold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">City</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((business) => (
                  <tr key={business.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{business.name}</td>
                    <td className="py-3 px-4">{business.category}</td>
                    <td className="py-3 px-4">{business.city}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded ${
                          business.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {business.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => router.push(`/admin/businesses/edit/${business.id}`)}
                        className="text-dominion-blue hover:text-dominion-gold mr-3"
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
  );
}
