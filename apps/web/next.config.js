/** @type {import('next').NextConfig} */

import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const nextConfig = {

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add PrismaPlugin to server-side webpack plugins
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*', // any request to /api/* on your frontend
        destination: 'https://orange-http-backend.vercel.app/api/:path*', // sends request to url/api/* backend -> since my  backend urls will have url/api/v1/user/login 
      },
    ];
  },

};

export default nextConfig;
