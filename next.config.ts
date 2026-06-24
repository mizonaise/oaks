import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: false,
  // Allow LAN access to the dev server (and its HMR socket) from other devices.
  // allowedDevOrigins: ["192.168.33.139", "192.168.33.*"],
  async rewrites() {
    return [
      // Proxy the shape API (api.tecnibo.com) through a same-origin path.
      {
        source: "/api/shape/:path*",
        destination: `${process.env.NEXT_PUBLIC_SHAPE_API}/:path*`,
      },
      // Proxy the backend API (backend.tecnibo.com) — serves article data and
      // the configurator form `/tree`.
      {
        source: "/api/article/:path*",
        destination: `${process.env.NEXT_PUBLIC_ARTICLE_API}/:path*`,
      },
      // Proxy the form export API (backend.tecnibo.com) — serves the configurator form `/tree`.
      {
        source: "/api/form-expo/:path*",
        destination: `${process.env.NEXT_PUBLIC_FORMEXPO_API}/:path*`,
      },
    ];
  },
};

export default nextConfig;
