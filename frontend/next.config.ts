import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Disabled static export due to dynamic routes ([id], [address])
  // For Walrus Sites deployment, you have two options:
  // 1. Remove dynamic routes and use query parameters (e.g., /item?id=xxx)
  // 2. Pre-generate all possible paths at build time with generateStaticParams
  // 3. Use a client-side SPA approach with hash routing
  //
  // Uncomment below for static export (requires fixing dynamic routes):
  // output: 'export',

  // ✅ Add trailing slashes for cleaner URLs
  trailingSlash: true,

  // ✅ Disable image optimization (recommended for static export)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;