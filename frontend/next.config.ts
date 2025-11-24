import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Static export enabled for Walrus Sites deployment
  // Dynamic routes converted to query parameters: /item?id=xxx, /profile?address=xxx
  output: 'export',

  // ✅ Add trailing slashes for cleaner URLs
  trailingSlash: true,

  // ✅ Disable image optimization (required for static export)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;