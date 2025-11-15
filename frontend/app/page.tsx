'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { businessesAPI } from '@/lib/api';

// Predefined categories
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

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading data from API...');
      const [categoriesRes, citiesRes, featuredRes] = await Promise.all([
        businessesAPI.getCategories(),
        businessesAPI.getCities(),
        businessesAPI.getFeatured(),
      ]);
      
      console.log('Data loaded successfully:', {
        categories: categoriesRes.data?.length || 0,
        cities: citiesRes.data?.length || 0,
        featured: featuredRes.data?.length || 0,
      });
      
      // Merge predefined categories with database categories
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
      setFeatured(featuredRes.data);
    } catch (error: any) {
      console.error('Error loading data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Set empty arrays to prevent UI errors
      setCategories([]);
      setCities([]);
      setFeatured([]);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery);
    
    // Use custom category if "Other" is selected and custom value is provided
    const finalCategory = selectedCategory === 'Other' && customCategory ? customCategory : selectedCategory;
    if (finalCategory && finalCategory !== 'Other') params.set('category', finalCategory);
    
    // Use custom city if "Other" is selected and custom value is provided
    const finalCity = selectedCity === 'Other' && customCity ? customCity : selectedCity;
    if (finalCity && finalCity !== 'Other') params.set('city', finalCity);
    
    if (selectedState) params.set('state', selectedState);
    
    router.push(`/results?${params.toString()}`);
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/results?category=${encodeURIComponent(category)}`);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-dominion-blue via-blue-900 to-dominion-blue relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-dominion-gold/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          {/* Main Heading with Animation */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block mb-3">
              <span className="text-dominion-gold text-sm font-semibold tracking-widest uppercase px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                🤝 Household of Faith Directory
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-tight">
              Fostering Sincere and
              <span className="block bg-gradient-to-r from-dominion-gold via-yellow-300 to-dominion-gold bg-clip-text text-transparent animate-gradient">
                Brotherly Patronage
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-light tracking-wide">
              Within the Household of Faith
            </p>
          </div>

          {/* Search Bar - Moved to Top */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="backdrop-blur-xl bg-white/95 p-4 rounded-2xl shadow-2xl border border-white/20 hover:shadow-dominion-gold/20 hover:shadow-3xl transition-all duration-300">
              {/* Main Search Input */}
              <div className="flex flex-col md:flex-row gap-3 mb-3">
                <div className="flex-1 relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
                  <input
                    type="text"
                    placeholder="Search name, skill, business, or city…"
                    className="w-full pl-16 pr-6 py-5 text-gray-800 text-lg rounded-xl focus:outline-none focus:ring-3 focus:ring-dominion-gold bg-white border-2 border-transparent focus:border-dominion-gold transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-dominion-gold to-yellow-500 text-dominion-blue px-10 py-5 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-dominion-gold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Search Now
                </button>
              </div>
              
              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      if (e.target.value !== 'Other') setCustomCategory('');
                    }}
                    className="w-full px-4 py-3 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-dominion-gold bg-white border-2 border-gray-200 hover:border-dominion-gold transition-all"
                  >
                    <option value="">All Skills/Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.category} value={cat.category}>
                        {cat.category}{cat.count > 0 ? ` (${cat.count})` : ''}
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
                      className="w-full px-4 py-3 mt-2 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-dominion-gold bg-white border-2 border-gray-200 hover:border-dominion-gold transition-all"
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
                    className="w-full px-4 py-3 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-dominion-gold bg-white border-2 border-gray-200 hover:border-dominion-gold transition-all"
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city.city} value={city.city}>
                        {city.city}
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
                      className="w-full px-4 py-3 mt-2 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-dominion-gold bg-white border-2 border-gray-200 hover:border-dominion-gold transition-all"
                    />
                  )}
                </div>
                
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="px-4 py-3 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-dominion-gold bg-white border-2 border-gray-200 hover:border-dominion-gold transition-all"
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
            
            {/* How to Use */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-white">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="text-xl">1️⃣</span>
                <span className="text-xs md:text-sm font-medium">Search for a skill or artisan</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="text-xl">2️⃣</span>
                <span className="text-xs md:text-sm font-medium">Connect with verified brethren</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="text-xl">3️⃣</span>
                <span className="text-xs md:text-sm font-medium">Deal sincerely — as unto the Lord</span>
              </div>
            </div>
          </div>

          {/* Mission Statement Card */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <p className="text-gray-100 text-lg leading-relaxed mb-6">
                This directory exists to strengthen the bonds of fellowship in the Body of Christ by making it easy for brethren to find and support one another in business, craftsmanship, and skilled services. Here, you'll find trusted artisans, entrepreneurs, professionals, and service providers within your assembly and community.
              </p>
              <div className="bg-gradient-to-r from-dominion-gold/20 to-yellow-500/20 rounded-2xl p-6 border border-dominion-gold/30">
                <p className="text-dominion-gold font-semibold text-lg mb-2">
                  💡 Our Commitment to Excellence
                </p>
                <p className="text-white/90">
                  We encourage everyone listed and everyone who patronizes them to emulate Christ in character — being truthful, fair, diligent, and sincere in all dealings. Let your work be a testimony. Let your interaction reflect Christ.
                </p>
              </div>
              
              {/* Core Values */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:border-dominion-gold/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-3xl mb-2">⭐</div>
                  <h3 className="text-white font-bold text-lg mb-1">Be Excellent</h3>
                  <p className="text-blue-200 text-sm">Deliver quality work and service</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:border-dominion-gold/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-3xl mb-2">🤝</div>
                  <h3 className="text-white font-bold text-lg mb-1">Be Honest</h3>
                  <p className="text-blue-200 text-sm">Practice truthfulness and fairness</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:border-dominion-gold/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-3xl mb-2">❤️</div>
                  <h3 className="text-white font-bold text-lg mb-1">Be Brotherly</h3>
                  <p className="text-blue-200 text-sm">Treat one another with love</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="max-w-6xl mx-auto mb-20">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">Browse by Skill/Service</h2>
              <p className="text-blue-200 text-lg">Find the right talent for your needs</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {categories.slice(0, 8).map((item, index) => (
                <button
                  key={item.category}
                  onClick={() => handleCategoryClick(item.category)}
                  className="group relative bg-white/95 backdrop-blur-sm text-dominion-blue px-6 py-6 rounded-2xl font-semibold hover:bg-gradient-to-br hover:from-dominion-gold hover:to-yellow-500 hover:text-dominion-blue transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl border-2 border-transparent hover:border-white/30"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📋</span>
                    <span className="text-sm">{item.category}</span>
                    <span className="text-xs bg-dominion-gold/20 group-hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
                      {item.count} {item.count === 1 ? 'listing' : 'listings'}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-dominion-gold/0 to-yellow-500/0 group-hover:from-dominion-gold/10 group-hover:to-yellow-500/10 transition-all duration-300"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Listings */}
          {featured.length > 0 && (
            <div className="max-w-7xl mx-auto pb-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">Featured Listings</h2>
                <p className="text-blue-200 text-lg">Trusted brethren serving with excellence</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featured.map((business) => (
                  <div
                    key={business.id}
                    className="group bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:-translate-y-3 transition-all duration-300 hover:shadow-dominion-gold/20 hover:shadow-3xl border-2 border-transparent hover:border-dominion-gold/50"
                  >
                    <div className="relative overflow-hidden">
                      {business.images && business.images.length > 0 ? (
                        <img
                          src={business.images[0]}
                          alt={business.name}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-56 bg-gradient-to-br from-dominion-blue to-blue-800 flex items-center justify-center">
                          <span className="text-6xl">👤</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-dominion-gold text-dominion-blue px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ⭐ Featured
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-dominion-blue mb-2 group-hover:text-dominion-gold transition-colors">
                        {business.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🏷️</span>
                        <p className="text-dominion-gold font-semibold">{business.category}</p>
                      </div>
                      <div className="flex items-center gap-2 mb-5">
                        <span className="text-lg">📍</span>
                        <p className="text-gray-500 text-sm">{business.city}, {business.state}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/business/${business.id}`)}
                        className="bg-gradient-to-r from-dominion-gold to-yellow-500 text-dominion-blue px-6 py-3 rounded-xl font-bold w-full hover:from-yellow-500 hover:to-dominion-gold transform hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl"
                      >
                        View Profile →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
