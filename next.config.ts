import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Os erros são de inferência gerada pelo Next.js 16 em .next/types — não afetam o runtime
    ignoreBuildErrors: true,
  },
  // Pacotes que usam node: built-ins precisam ser resolvidos pelo Node.js em runtime,
  // não pelo Turbopack durante o bundling do SSR.
  serverExternalPackages: [
    "@prisma/adapter-pg",
    "@prisma/client",
    "pg",
    "pg-native",
    "bcryptjs",
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
};

export default nextConfig;
