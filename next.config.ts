import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "i.vimeocdn.com",
      },
      {
        protocol: "https",
        hostname: "vumbnail.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/directors/gabriela-olmedo",
        destination: "/directors/gabriela-ortega",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
