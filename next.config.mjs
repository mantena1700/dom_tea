/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable PWA features
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    unoptimized: true, // For static export compatibility
    formats: ['image/avif', 'image/webp'],
  },

  // PWA-friendly settings
  trailingSlash: false,
  reactStrictMode: true,

  // Allow all local network access for development
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    '192.168.113.2',
    '192.168.18.16',
    '192.168.56.1',
    '172.30.32.1',
  ],

  // Experimental features for better mobile performance
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
