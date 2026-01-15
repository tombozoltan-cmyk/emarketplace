import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/ops/portal-7d3k9a2f/:path*",
        destination: "/ops/nova/:path*",
        permanent: true,
      },
      {
        source: "/ops/portal-7d3k9a2f",
        destination: "/ops/nova",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
