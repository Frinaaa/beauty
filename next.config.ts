import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.20.10.4"],
  turbopack: {
    root: path.resolve(import.meta.dirname || process.cwd()),
  },
};

export default nextConfig;
