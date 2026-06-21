import type { NextConfig } from "next";

// BACKEND_ORIGIN: set this in Vercel Dashboard → Settings → Environment Variables
// e.g. http://104.198.6.169:3001  (no trailing slash)
// Falls back to hardcoded VPS IP if not set.
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN ?? "http://104.198.6.169:3001";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // All /api/* calls from the browser are proxied server-side to the backend.
  // NEXT_PUBLIC_API_URL must be EMPTY (or unset) in Vercel so that axios uses
  // relative URLs and this rewrite kicks in — avoiding mixed-content and CORS.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
  // Google Identity popup uses window.postMessage; default COOP blocks it.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/order/:id(\\d+)",
        destination: "/order/buyer/:id",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
