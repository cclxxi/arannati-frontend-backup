import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**", // Временно разрешаем все домены
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  reactStrictMode: false,
  // Add transpilePackages to help with chunk loading issues
  transpilePackages: [
    "rc-cascader",
    "rc-select",
    "rc-tree",
    "rc-util",
    "antd",
    "@ant-design/icons",
    "@ant-design/plots",
  ],
  productionBrowserSourceMaps: false,
  // Enable source maps in development to prevent 404 errors
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = "eval-source-map";
    }
    return config;
  },
};

export default nextConfig;
