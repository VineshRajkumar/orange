/** @type {import('next').NextConfig} */
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

const nextConfig = {

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add PrismaPlugin to server-side webpack plugins
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  }

};

export default nextConfig;
