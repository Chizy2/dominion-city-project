'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <>
      {/* White section before footer */}
      <div className="bg-white py-8"></div>
      
      <footer className="bg-dominion-blue text-white border-t border-white/10">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-12">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <Link href="/" className="inline-block group">
                <Image
                  src="/logo.svg"
                  alt="Dominion City"
                  width={200}
                  height={80}
                  className="w-32 sm:w-40 md:w-48 h-auto transition-all duration-300 group-hover:opacity-90 group-hover:scale-105"
                  priority
                />
              </Link>
            </div>

            {/* Directory Info Section */}
            <div className="flex-1 text-center lg:text-left max-w-md">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white">Dominion City Directory</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Connecting you with the best businesses and professionals within the Household of Faith
              </p>
            </div>

            {/* Contact Section - Right End */}
            <div className="flex-shrink-0 text-center lg:text-right">
              <h4 className="text-base sm:text-lg font-semibold mb-3 text-white">Get in Touch</h4>
              <p className="text-gray-300 mb-2 text-sm">For enquiries:</p>
              <a 
                href="mailto:contact@dcdirect.online" 
                className="inline-flex items-center gap-2 text-dominion-gold hover:text-yellow-400 transition-all duration-300 font-semibold text-sm sm:text-base group lg:justify-end lg:ml-auto"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@dcdirect.online
              </a>
            </div>
          </div>
          
          {/* Bottom Border */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-400 mb-4">
              <p className="text-gray-300">Fostering Sincere and Brotherly Patronage</p>
              <p className="text-gray-300">Within the Household of Faith</p>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm text-center">
              © {new Date().getFullYear()} Dominion City. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
