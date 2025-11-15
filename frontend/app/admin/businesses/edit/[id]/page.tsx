'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminAPI, businessesAPI } from '@/lib/api';

const PREDEFINED_CATEGORIES = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'Fashion Designer',
  'Tailor',
  'Auto Mechanic',
  'Auto Electrician',
  'Panel Beater',
  'Hair Stylist',
  'Barber',
  'Makeup Artist',
  'Caterer',
  'Event Planner',
  'Photographer',
  'Videographer',
  'Graphic Designer',
  'Web Developer',
  'Cleaner',
  'Laundry Service',
  'Tutor',
  'Fitness Trainer',
  'Baker',
  'Chef',
  'Security Service',
  'Logistics',
  'Real Estate',
  'Interior Designer',
  'Architect',
  'Lawyer',
  'Accountant',
  'Doctor',
  'Dentist',
  'Pharmacy',
  'Veterinarian',
];

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    const initializeData = async () => {
      await loadCities();
      await loadBusiness();
    };
    initializeData();
  }, [businessId]);

  const loadCities = async () => {
    try {
      const citiesRes = await businessesAPI.getCities();
      setCities(citiesRes.data);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadBusiness = async () => {
    try {
      const response = await businessesAPI.getById(businessId);
      const business = response.data;
      
      const cityExists = cities.length > 0 && cities.some((c: any) => c.city === business.city);
      const cityValue = cityExists ? business.city : (business.city ? 'Other' : '');
      const customCityValue = !cityExists && business.city ? business.city : '';
      
      const categoryExists = PREDEFINED_CATEGORIES.includes(business.category);
      const categoryValue = categoryExists ? business.category : (business.category ? 'Other' : '');
      const customCategoryValue = !categoryExists && business.category ? business.category : '';
      
      setFormData({
        name: business.name || '',
        category: categoryValue,
        description: business.description || '',
        phone: business.phone || '',
        email: business.email || '',
        address: business.address || '',
        city: cityValue,
        state: business.state || '',
        country: business.country || 'Nigeria',
        church_branch: business.church_branch || '',
        whatsapp: business.whatsapp || '',
        website: business.website || '',
        instagram: business.instagram || '',
        is_active: business.is_active !== undefined ? business.is_active : true,
        featured: business.featured || false,
      });
      
      if (customCityValue) setCustomCity(customCityValue);
      if (customCategoryValue) setCustomCategory(customCategoryValue);
    } catch (error) {
      console.error('Error loading business:', error);
    } finally {
      setLoading(false);
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
    setSubmitting(true);

    try {
      const submitFormData = new FormData();
      Object.keys(formData).forEach((key) => {
        let value = formData[key as keyof typeof formData];
        if (key === 'latitude' || key === 'longitude') return;
        if (key === 'category' && value === 'Other' && customCategory) {
          value = customCategory;
        }
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

      await adminAPI.update(businessId, submitFormData);
      router.push('/admin/businesses');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating business');
    } finally {
      setSubmitting(false);
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
      <nav className="bg-dominion-blue shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Edit Business</h1>
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
                  {PREDEFINED_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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
                Add More Images (up to 5)
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
                disabled={submitting}
                className="bg-dominion-gold text-dominion-blue px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update Business'}
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

