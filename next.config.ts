import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    "@prisma/adapter-pg",
    "@prisma/client",
    "pg",
    "bcryptjs",
    "@auth/prisma-adapter",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wzjwanopndljqcpewonh.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // pg optionally tries to require('pg-native') — alias to false so the bundler
  // silently skips it instead of crashing with externalRequire on Vercel
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "pg-native": false,
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      // false is not valid here; use an empty module path trick via webpack above
      // Turbopack will respect serverExternalPackages + webpack alias fallback
    },
  },
};

export default nextConfig;
