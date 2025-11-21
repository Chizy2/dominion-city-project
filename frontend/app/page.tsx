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
          <div className="text-center mb-6 sm:mb-8 animate-fade-in">
            <div className="inline-block mb-2 sm:mb-3">
              <span className="text-dominion-gold text-xs sm:text-sm font-semibold tracking-widest uppercase px-3 sm:px-4 py-1 sm:py-2 bg-white/10 rounded-full backdrop-blur-sm flex items-center gap-2 justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Household of Faith Directory
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-3 sm:mb-4 leading-tight px-2">
              Fostering Sincere and
              <span className="block bg-gradient-to-r from-dominion-gold via-yellow-300 to-dominion-gold bg-clip-text text-transparent animate-gradient leading-tight mt-1">
                Brotherly Patronage
              </span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-blue-100 font-light tracking-wide px-4">
              Within the Household of Faith
            </p>
          </div>

          {/* Search Bar - Moved to Top */}
          <div className="max-w-5xl mx-auto mb-8 sm:mb-12">
            <div className="backdrop-blur-xl bg-white/95 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 hover:shadow-dominion-gold/20 hover:shadow-3xl transition-all duration-300">
              {/* Main Search Input */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-xl sm:text-2xl">🔍</span>
                  <input
                    type="text"
                    placeholder="Search name, skill, business, or city…"
                    className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-5 text-gray-800 text-base sm:text-lg rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-dominion-gold bg-white border-2 border-transparent focus:border-dominion-gold transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-dominion-gold to-yellow-500 text-dominion-blue px-6 sm:px-10 py-3 sm:py-5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:from-yellow-500 hover:to-dominion-gold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  Search Now
                </button>
              </div>
              
              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      if (e.target.value !== 'Other') setCustomCategory('');
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-gray-800 text-sm sm:text-base rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-dominion-gold bg-white border-2 border-gray-200 hover:border-dominion-gold transition-all"
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-gray-800 text-sm sm:text-base rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-dominion-gold bg-white border-2 border-gray-200 hover:border-dominion-gold transition-all"
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
            <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-2 sm:gap-4 text-white px-2">
              <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-white/20">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Search for a skill or artisan</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-white/20">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Connect with verified brethren</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-white/20">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Deal sincerely — as unto the Lord</span>
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
                <p className="text-dominion-gold font-semibold text-lg mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Our Commitment to Excellence
                </p>
                <p className="text-white/90">
                  We encourage everyone listed and everyone who patronizes them to emulate Christ in character — being truthful, fair, diligent, and sincere in all dealings. Let your work be a testimony. Let your interaction reflect Christ.
                </p>
              </div>
              
              {/* Core Values */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:border-dominion-gold/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-2">
                    <svg className="w-8 h-8 text-dominion-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">Be Excellent</h3>
                  <p className="text-blue-200 text-sm">Deliver quality work and service</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:border-dominion-gold/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-2">
                    <svg className="w-8 h-8 text-dominion-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">Be Honest</h3>
                  <p className="text-blue-200 text-sm">Practice truthfulness and fairness</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:border-dominion-gold/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-2">
                    <svg className="w-8 h-8 text-dominion-gold" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">Be Brotherly</h3>
                  <p className="text-blue-200 text-sm">Treat one another with love</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="max-w-6xl mx-auto mb-12 sm:mb-20">
            <div className="text-center mb-6 sm:mb-10 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">Browse by Skill/Service</h2>
              <p className="text-blue-200 text-sm sm:text-base md:text-lg">Find the right talent for your needs</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 px-4">
              {categories.slice(0, 8).map((item, index) => (
                <button
                  key={item.category}
                  onClick={() => handleCategoryClick(item.category)}
                  className="group relative bg-white/95 backdrop-blur-sm text-dominion-blue px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl font-semibold hover:bg-gradient-to-br hover:from-dominion-gold hover:to-yellow-500 hover:text-dominion-blue transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-2xl border-2 border-transparent hover:border-white/30"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-dominion-blue group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-xs sm:text-sm text-center leading-tight">{item.category}</span>
                    <span className="text-[10px] sm:text-xs bg-dominion-gold/20 group-hover:bg-white/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full transition-colors">
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
            <div className="max-w-7xl mx-auto pb-8 sm:pb-10 px-4">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">Featured Listings</h2>
                <p className="text-blue-200 text-sm sm:text-base md:text-lg">Trusted brethren serving with excellence</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                          <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-dominion-gold text-dominion-blue px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Featured
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-dominion-blue mb-2 group-hover:text-dominion-gold transition-colors">
                        {business.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-dominion-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <p className="text-dominion-gold font-semibold">{business.category}</p>
                      </div>
                      <div className="flex items-center gap-2 mb-5">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
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
