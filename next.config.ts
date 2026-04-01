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
    // NOTE: pg-native removed from here — aliased to false below instead
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
  // pg optionally tries to require('pg-native') — alias it to false so
  // both Turbopack (Vercel) and webpack silently skip it
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "pg-native": false,
    };
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        "pg-native": false,
      },
    },
  },
};

export default nextConfig;
