import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.theodouwes.com" }],
        destination: "https://theodouwes.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
