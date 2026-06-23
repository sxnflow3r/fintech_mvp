import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the dev-mode overlay/badge so it never appears in demo recordings.
  devIndicators: false,
};

export default nextConfig;
