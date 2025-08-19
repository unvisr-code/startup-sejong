/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.instagram.com', 'ihgojwljhbdrfmqhlspb.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // PWA Support
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP']
  },
  // Ensure proper handling of client-side code
  transpilePackages: [],
}

module.exports = nextConfig