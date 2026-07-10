import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
  },
  webpack: (config) => {
    // Don't trigger dev rebuilds when SQLite writes to dev.db or when Prisma
    // regenerates its client. These are normal runtime side-effects, not code
    // changes, and watching them causes the dev server to appear to "loop".
    config.watchOptions = {
      ...(config.watchOptions ?? {}),
      ignored: [
        "**/node_modules/**",
        "**/.next/**",
        "**/.git/**",
        "**/dev.db",
        "**/dev.db-journal",
        "**/dev.db-wal",
        "**/dev.db-shm",
        "**/src/generated/prisma/**",
      ],
    };
    return config;
  },
};

export default nextConfig;
