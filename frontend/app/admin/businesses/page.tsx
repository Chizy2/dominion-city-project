'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';

export default function AdminBusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAll({
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        status: selectedStatus || undefined,
      });
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this business?')) return;

    try {
      await adminAPI.delete(id.toString());
      loadBusinesses();
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Error deleting business');
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadBusinesses();
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategory, selectedStatus]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-dominion-blue shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Manage Businesses</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-white hover:text-dominion-gold transition"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/admin/businesses/add')}
                className="bg-dominion-gold text-dominion-blue px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Add Business
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
            >
              <option value="">All Categories</option>
              <option value="Electricians">Electricians</option>
              <option value="Fashion Designers">Fashion Designers</option>
              <option value="Mechanics">Mechanics</option>
              <option value="Hair Stylists">Hair Stylists</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Businesses Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dominion-blue text-white">
                <tr>
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">City</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Views</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dominion-blue"></div>
                    </td>
                  </tr>
                ) : businesses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No businesses found
                    </td>
                  </tr>
                ) : (
                  businesses.map((business) => (
                    <tr key={business.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{business.id}</td>
                      <td className="py-3 px-4 font-semibold">{business.name}</td>
                      <td className="py-3 px-4">{business.category}</td>
                      <td className="py-3 px-4">{business.city}</td>
                      <td className="py-3 px-4">{business.phone}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            business.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {business.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{business.views}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => router.push(`/admin/businesses/edit/${business.id}`)}
                          className="text-dominion-blue hover:text-dominion-gold mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(business.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
