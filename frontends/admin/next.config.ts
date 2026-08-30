import type { NextConfig } from "next";

/**
 * Медиа платформы отдаются по её адресу: без него `next/image` отвечает 400
 * на обложку поста. Адрес читается тем же ключом, что и API консоли.
 */
function platformImagePattern() {
  const base = process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ?? "http://localhost:8080";
  const url = new URL(base);

  return {
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
  };
}

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
      platformImagePattern(),
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
