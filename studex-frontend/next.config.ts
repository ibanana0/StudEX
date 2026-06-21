import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
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
