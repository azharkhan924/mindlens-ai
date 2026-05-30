import type { NextConfig } from "next";

const apiProxyUrl =
  process.env.API_PROXY_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8081";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyUrl.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
