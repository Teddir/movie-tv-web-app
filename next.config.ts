import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "media.themoviedb.org",
      },
      {
        protocol: "https",
        hostname: "gravatar.com",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
    ],
  },
  env: {
    TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
  }
};

export default nextConfig;
