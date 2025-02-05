import type { NextConfig } from "next";
import withPWA from "./lib/next-pwa-wrapper.cjs";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["img.clerk.com", "utfs.io"],
  },
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "w557yaqfp2.ufs.sh",
  //       pathname: "/f/*",
  //     },
  //   ],
  // },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/conversations",
        permanent: true,
      },
    ];
  },
};

const PWAWrapper = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default PWAWrapper(nextConfig);
