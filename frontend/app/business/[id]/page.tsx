'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { businessesAPI } from '@/lib/api';
import { Loader } from '@googlemaps/js-api-loader';

export default function BusinessProfilePage() {
  const params = useParams();
  const businessId = params.id as string;
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const response = await businessesAPI.getById(businessId);
      setBusiness(response.data);
    } catch (error) {
      console.error('Error loading business:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dominion-blue"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!business) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl text-gray-600">Business not found</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Images */}
            {business.images && business.images.length > 0 && (
              <div className="mb-8">
                <img
                  src={business.images[0]}
                  alt={business.name}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Main Info */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-dominion-blue mb-2">
                    {business.name}
                  </h1>
                  <p className="text-xl text-dominion-gold font-semibold mb-4">
                    {business.category}
                  </p>
                </div>
                <button className="bg-dominion-gold text-dominion-blue px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                  Call Now
                </button>
              </div>

              <p className="text-gray-700 text-lg mb-6">
                {business.description || 'No description available'}
              </p>
            </div>

            {/* Contact & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-dominion-blue mb-4">
                  Contact Information
                </h2>
                {business.phone && (
                  <p className="text-gray-700 mb-3">
                    <span className="font-semibold">Phone:</span> {business.phone}
                  </p>
                )}
                {business.email && (
                  <p className="text-gray-700 mb-3">
                    <span className="font-semibold">Email:</span> {business.email}
                  </p>
                )}
                {business.whatsapp && (
                  <a
                    href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    WhatsApp
                  </a>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-dominion-blue mb-4">
                  Location
                </h2>
                {business.address && (
                  <p className="text-gray-700 mb-2">{business.address}</p>
                )}
                <p className="text-gray-700 mb-2">
                  {business.city}, {business.state || business.country}
                </p>
                {business.church_branch && (
                  <p className="text-gray-700 mt-3">
                    <span className="font-semibold">Church Branch:</span> {business.church_branch}
                  </p>
                )}
              </div>
            </div>

            {/* Social Links */}
            {(business.website || business.instagram) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-dominion-blue mb-4">
                  Connect With Us
                </h2>
                <div className="flex gap-4">
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dominion-blue hover:text-dominion-gold transition"
                    >
                      Website
                    </a>
                  )}
                  {business.instagram && (
                    <a
                      href={`https://instagram.com/${business.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dominion-blue hover:text-dominion-gold transition"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

