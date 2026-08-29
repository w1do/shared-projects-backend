import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Прод-образ (infra/docker/admin-front.Dockerfile) собирает standalone-сервер;
  // dev-запуск `next start` остаётся без него.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/admin",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
