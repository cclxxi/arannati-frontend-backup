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
    ],
  },
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
};

export default nextConfig;
