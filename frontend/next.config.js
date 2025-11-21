/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Production optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  images: {
    domains: [
      'images.unsplash.com',
      'ussoyjjlauhggwsezbhy.supabase.co', // Supabase storage
      'dcdirect.online', // Production domain
      // Only include localhost in development
      ...(process.env.NODE_ENV !== 'production' ? ['localhost'] : [])
    ],
    unoptimized: false, // Allow image optimization
  },
  // Removed output: "export" because app uses dynamic features:
  // - Search params (useSearchParams)
  // - API routes to backend
  // - Real-time data fetching
  // Use 'next build' for standard build or remove this comment to enable static export
};

module.exports = nextConfig;

