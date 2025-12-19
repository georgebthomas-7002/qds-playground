/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www-qualitydatasystems-com.sandbox.hs-sites.com',
        pathname: '/hs-fs/hubfs/**',
      },
    ],
  },
  // Required for @react-pdf/renderer to work on Vercel serverless
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
}

module.exports = nextConfig
