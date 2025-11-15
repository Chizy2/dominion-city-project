'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { businessesAPI } from '@/lib/api';

// Predefined categories from admin forms
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

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    if (search) setSearchQuery(search);
    if (category) setSelectedCategory(category);
    if (city) setSelectedCity(city);
    if (state) setSelectedState(state);

    loadData();
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading results with params:', {
        search: searchParams.get('search'),
        category: searchParams.get('category'),
        city: searchParams.get('city'),
        state: searchParams.get('state'),
      });
      
      const [businessesRes, categoriesRes, citiesRes] = await Promise.all([
        businessesAPI.getAll({
          search: searchParams.get('search') || undefined,
          category: searchParams.get('category') || undefined,
          city: searchParams.get('city') || undefined,
          state: searchParams.get('state') || undefined,
        }),
        businessesAPI.getCategories(),
        businessesAPI.getCities(),
      ]);

      console.log('Results loaded:', {
        businessesCount: businessesRes.data?.length || 0,
        categoriesCount: categoriesRes.data?.length || 0,
        citiesCount: citiesRes.data?.length || 0,
      });

      setBusinesses(businessesRes.data || []);
      
      // Merge predefined categories with database categories
      const dbCategories = categoriesRes.data.map((cat: any) => cat.category);
      const allCategories = PREDEFINED_CATEGORIES.map(category => {
        const dbCat = categoriesRes.data.find((cat: any) => cat.category === category);
        return {
          category,
          count: dbCat ? dbCat.count : 0
        };
      });
      
      // Add any database categories not in predefined list
      categoriesRes.data.forEach((cat: any) => {
        if (!PREDEFINED_CATEGORIES.includes(cat.category)) {
          allCategories.push(cat);
        }
      });
      
      setCategories(allCategories);
      setCities(citiesRes.data);
    } catch (error: any) {
      console.error('Error loading results:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Set empty arrays to prevent UI errors
      setBusinesses([]);
      setCategories([]);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    
    // Use custom category if "Other" is selected and custom value is provided
    const finalCategory = selectedCategory === 'Other' && customCategory ? customCategory : selectedCategory;
    if (finalCategory && finalCategory !== 'Other') params.set('category', finalCategory);
    
    // Use custom city if "Other" is selected and custom value is provided
    const finalCity = selectedCity === 'Other' && customCity ? customCity : selectedCity;
    if (finalCity && finalCity !== 'Other') params.set('city', finalCity);
    
    if (selectedState) params.set('state', selectedState);
    router.push(`/results?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setCustomCategory('');
    setSelectedCity('');
    setCustomCity('');
    setSelectedState('');
    router.push('/results');
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or description..."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    if (e.target.value !== 'Other') setCustomCategory('');
                  }}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category} ({cat.count})
                    </option>
                  ))}
                  <option value="Other">Other (Enter manually)</option>
                </select>
                {selectedCategory === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter category..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold mt-2"
                  />
                )}
              </div>

              <div>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    if (e.target.value !== 'Other') setCustomCity('');
                  }}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city.city} value={city.city}>
                      {city.city} ({city.count})
                    </option>
                  ))}
                  <option value="Other">Other (Enter manually)</option>
                </select>
                {selectedCity === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter city..."
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold mt-2"
                  />
                )}
              </div>

              <div>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    // Auto-apply state filter when changed
                    const params = new URLSearchParams(searchParams.toString());
                    if (e.target.value) {
                      params.set('state', e.target.value);
                    } else {
                      params.delete('state');
                    }
                    router.push(`/results?${params.toString()}`);
                  }}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dominion-gold"
                >
                  <option value="">All States</option>
                  <option value="Abia">Abia</option>
                  <option value="Adamawa">Adamawa</option>
                  <option value="Akwa Ibom">Akwa Ibom</option>
                  <option value="Anambra">Anambra</option>
                  <option value="Bauchi">Bauchi</option>
                  <option value="Bayelsa">Bayelsa</option>
                  <option value="Benue">Benue</option>
                  <option value="Borno">Borno</option>
                  <option value="Cross River">Cross River</option>
                  <option value="Delta">Delta</option>
                  <option value="Ebonyi">Ebonyi</option>
                  <option value="Edo">Edo</option>
                  <option value="Ekiti">Ekiti</option>
                  <option value="Enugu">Enugu</option>
                  <option value="FCT">FCT (Abuja)</option>
                  <option value="Gombe">Gombe</option>
                  <option value="Imo">Imo</option>
                  <option value="Jigawa">Jigawa</option>
                  <option value="Kaduna">Kaduna</option>
                  <option value="Kano">Kano</option>
                  <option value="Katsina">Katsina</option>
                  <option value="Kebbi">Kebbi</option>
                  <option value="Kogi">Kogi</option>
                  <option value="Kwara">Kwara</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Nasarawa">Nasarawa</option>
                  <option value="Niger">Niger</option>
                  <option value="Ogun">Ogun</option>
                  <option value="Ondo">Ondo</option>
                  <option value="Osun">Osun</option>
                  <option value="Oyo">Oyo</option>
                  <option value="Plateau">Plateau</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Sokoto">Sokoto</option>
                  <option value="Taraba">Taraba</option>
                  <option value="Yobe">Yobe</option>
                  <option value="Zamfara">Zamfara</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSearch}
                className="bg-dominion-gold text-dominion-blue px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Search
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results */}
          <div>
            <h2 className="text-2xl font-bold text-dominion-blue mb-6">
              {loading ? 'Loading...' : `Found ${businesses.length} ${businesses.length === 1 ? 'business' : 'businesses'}`}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-dominion-blue"></div>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">No businesses found. Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover-lift"
                  >
                    {business.images && business.images.length > 0 && (
                      <img
                        src={business.images[0]}
                        alt={business.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-dominion-blue mb-2">
                        {business.name}
                      </h3>
                      <p className="text-dominion-gold font-semibold mb-2">
                        {business.category}
                      </p>
                      <p className="text-gray-600 mb-2">
                        📍 {business.city}, {business.state || business.country}
                      </p>
                      {business.phone && (
                        <p className="text-gray-600 mb-2">
                          📞 {business.phone}
                        </p>
                      )}
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {business.description || 'No description available'}
                      </p>
                      <button
                        onClick={() => router.push(`/business/${business.id}`)}
                        className="bg-dominion-gold text-dominion-blue px-4 py-2 rounded-lg font-semibold w-full hover:opacity-90 transition"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-dominion-blue"></div>
              <p className="mt-4 text-gray-600">Loading results...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    }>
      <ResultsContent />
    </Suspense>
  );
}
