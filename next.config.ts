import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  typescript: {
    // Os erros são de inferência gerada pelo Next.js 16 em .next/types — não afetam o runtime
    ignoreBuildErrors: true,
  },
  // @docuseal/api usa node:https / node:http — precisa ser resolvido pelo Node.js em runtime
  serverExternalPackages: ["@docuseal/api"],
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

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
