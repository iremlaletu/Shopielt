import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental:{
    staleTimes:{
      dynamic: 30
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "**.wixstatic.com",
      }, 
    ],
  },
};

export default nextConfig;

// Using experimental.staleTimes.dynamic = 30 ensures that all dynamic data stays fresh for 30 seconds by default.
// This avoids setting revalidate manually on every fetch, reduces redundant requests, and provides short-term caching out of the box.
// https://nextjs.org/docs/app/guides/caching?utm_source=chatgpt.com#staletime-experimental