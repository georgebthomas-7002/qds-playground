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
}

module.exports = nextConfig
