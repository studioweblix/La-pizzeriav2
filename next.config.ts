import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nwbpkbkcaipstswsdtaa.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    qualities: [75, 85, 90, 92, 95, 100],
  },
};

export default nextConfig;
