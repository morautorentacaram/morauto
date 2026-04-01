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
  // pg-native is not installed — point both bundlers to an empty stub
  // so pg falls back to pure-JS mode silently.
  turbopack: {
    resolveAlias: {
      "pg-native": "./lib/pg-native-stub.js",
    },
  },
};

export default nextConfig;
