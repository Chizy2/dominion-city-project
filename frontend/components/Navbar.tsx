'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isAdminRoute) return null;

  return (
    <nav className="bg-dominion-blue shadow-sm">
      <div className="container mx-auto px-4 py-2 sm:py-0">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Dominion City"
              width={200}
              height={80}
              className="w-24 sm:w-32 md:w-40 h-auto"
              priority
            />
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-white hover:text-dominion-gold transition"
            >
              Home
            </Link>
            <Link
              href="/admin/login"
              className="bg-dominion-gold text-dominion-blue px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition text-sm"
            >
              Admin Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20">
            <div className="flex flex-col space-y-3 pt-4">
              <Link
                href="/"
                className="text-white hover:text-dominion-gold transition px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/admin/login"
                className="bg-dominion-gold text-dominion-blue px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
