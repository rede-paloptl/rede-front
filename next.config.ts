import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim();
const r2PublicHostname = r2PublicUrl ? new URL(r2PublicUrl).hostname : null;
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      ...(isDev
        ? [{ protocol: "http" as const, hostname: "localhost", port: "4001", pathname: "/uploads/**" }]
        : []),
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "*.images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.redecinemapaloptl.org",
      },
      ...(r2PublicHostname
        ? [{ protocol: "https" as const, hostname: r2PublicHostname }]
        : []),
    ],
  },
};

export default nextConfig;
