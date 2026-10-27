import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // product photos come from Shopify's CDN
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com", pathname: "/s/files/**" }],
  },
  // the static build this replaced served /cart.html, /zh/index.html ...; keep those links working
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/:dir(zh)/index.html", destination: "/:dir", permanent: true },
      { source: "/:path(.+)\\.html", destination: "/:path", permanent: true },
    ];
  },
};

export default nextConfig;
