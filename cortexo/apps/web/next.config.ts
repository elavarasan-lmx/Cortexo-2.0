import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Transpile workspace packages
  transpilePackages: ['@cortexo/db'],

  // Strict mode for catching React issues early
  reactStrictMode: true,

  // Silence turbopack workspace root warning caused by multiple lockfiles
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },

  // Image optimization domains (for avatar URLs from OAuth providers)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Redirect root /settings to general settings
  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'cookie', key: 'next-auth.session-token' }],
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
