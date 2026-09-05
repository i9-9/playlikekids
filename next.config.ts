import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "X-Powered-By",
    value: "Ivan Nevares (https://inevares.com)",
  },
];

/** Public site CSP. Studio is excluded — it needs a looser policy for Sanity. */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://i.vimeocdn.com https://vumbnail.com",
  "font-src 'self'",
  "frame-src https://player.vimeo.com",
  "connect-src 'self' https://*.sanity.io https://cdn.sanity.io https://vimeo.com https://player.vimeo.com",
  "media-src 'self' https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  poweredByHeader: false,
  images: {
    // Next 16 only allows 75 unless listed. Home hero uses 90.
    qualities: [75, 90],
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
  async headers() {
    return [
      {
        source: "/studio/:path*",
        headers: securityHeaders,
      },
      {
        // Public routes only — keep Studio free of the site CSP.
        source: "/((?!studio(?:/|$)).*)",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
