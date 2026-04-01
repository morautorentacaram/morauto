import type { NextConfig } from "next";
import path from "path";

const pgNativeStub = path.resolve("./lib/pg-native-stub.js");

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
    // pg-native is an optional addon — stub it out so bundlers skip it cleanly
    "pg-native",
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
  webpack(config) {
    // Alias pg-native to an empty stub for webpack builds
    config.resolve.alias = {
      ...config.resolve.alias,
      "pg-native": pgNativeStub,
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      // Alias pg-native to local stub for Turbopack (Vercel production builds)
      "pg-native": pgNativeStub,
    },
  },
};

export default nextConfig;
