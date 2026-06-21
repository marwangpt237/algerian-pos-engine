/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable external packages for serverless
  serverExternalPackages: ['pg'],
  // Image optimization for product images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.openfoodfacts.org',
      },
      {
        protocol: 'https',
        hostname: 'images.openfoodfacts.org',
      },
    ],
  },
};

export default nextConfig;