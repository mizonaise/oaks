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
      // Proxy the form export API (backend.tecnibo.com) — serves the configurator form `/tree`.
      {
        source: "/api/form-expo/:path*",
        destination: `${process.env.NEXT_PUBLIC_FORMEXPO_API}/:path*`,
      },
      // Proxy the rp-engine API (backend.tecnibo.com) — serves article-data,
      // material-data and surface-data lookups (per name).
      {
        source: "/api/rp-engine/:path*",
        destination: `${process.env.NEXT_PUBLIC_RPENGINE_API}/:path*`,
      },
      // Proxy the oaksome products-config API (www.tecnibo.com) — serves the
      // saved form values for a template id, used to seed the configurator.
      {
        source: "/api/oaksome/:path*",
        destination: `${process.env.NEXT_PUBLIC_OAKSOME_API}/:path*`,
      },
    ];
  },
};

export default nextConfig;
