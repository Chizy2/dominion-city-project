'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI, businessesAPI } from '@/lib/api';

export default function AddBusinessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    church_branch: '',
    whatsapp: '',
    website: '',
    instagram: '',
    is_active: true,
    featured: false,
  });
  const [customCategory, setCustomCategory] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const citiesRes = await businessesAPI.getCities();
      setCities(citiesRes.data);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitFormData = new FormData();
      Object.keys(formData).forEach((key) => {
        let value = formData[key as keyof typeof formData];
        // Use custom category if "Other" is selected
        if (key === 'category' && value === 'Other' && customCategory) {
          value = customCategory;
        }
        // Use custom city if "Other" is selected
        if (key === 'city' && value === 'Other' && customCity) {
          value = customCity;
        }
        if (value !== null && value !== undefined && value !== '' && value !== 'Other') {
          submitFormData.append(key, String(value));
        }
      });

      images.forEach((image) => {
        submitFormData.append('images', image);
      });

      await adminAPI.create(submitFormData);
      router.push('/admin/businesses');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-dominion-blue shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Add Business</h1>
            <button
              onClick={() => router.push('/admin/businesses')}
              className="text-white hover:text-dominion-gold transition"
            >
              Back to List
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Name (Business or Individual) *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                  placeholder="e.g., Brother John Adeyemi or ABC Services"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Skill/Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value !== 'Other') setCustomCategory('');
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                  required
                >
                  <option value="">Select skill/category</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Painter">Painter</option>
                  <option value="Fashion Designer">Fashion Designer</option>
                  <option value="Tailor">Tailor</option>
                  <option value="Auto Mechanic">Auto Mechanic</option>
                  <option value="Auto Electrician">Auto Electrician</option>
                  <option value="Panel Beater">Panel Beater</option>
                  <option value="Hair Stylist">Hair Stylist</option>
                  <option value="Barber">Barber</option>
                  <option value="Makeup Artist">Makeup Artist</option>
                  <option value="Caterer">Caterer</option>
                  <option value="Event Planner">Event Planner</option>
                  <option value="Photographer">Photographer</option>
                  <option value="Videographer">Videographer</option>
                  <option value="Graphic Designer">Graphic Designer</option>
                  <option value="Web Developer">Web Developer</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Laundry Service">Laundry Service</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Fitness Trainer">Fitness Trainer</option>
                  <option value="Baker">Baker</option>
                  <option value="Chef">Chef</option>
                  <option value="Security Service">Security Service</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Interior Designer">Interior Designer</option>
                  <option value="Architect">Architect</option>
                  <option value="Lawyer">Lawyer</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Dentist">Dentist</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Veterinarian">Veterinarian</option>
                  <option value="Other">Other (Enter manually)</option>
                </select>
                {formData.category === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter skill/category..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold mt-2"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  City *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value !== 'Other') setCustomCity('');
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                  required
                >
                  <option value="">Select city</option>
                  {cities.map((city) => (
                    <option key={city.city} value={city.city}>
                      {city.city} ({city.count})
                    </option>
                  ))}
                  <option value="Other">Other (Enter manually)</option>
                </select>
                {formData.city === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter city..."
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold mt-2"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Church Branch/Assembly
                </label>
                <input
                  type="text"
                  name="church_branch"
                  value={formData.church_branch}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                  placeholder="e.g., Dominion City Church - Ikeja Assembly"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Images (up to 5)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Active</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Featured</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-dominion-gold text-dominion-blue px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Business'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/admin/businesses')}
                className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
