/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
        port: "",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/photo/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/pin/**",
      },
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Add rule for .mtl files
    config.module.rules.push({
      test: /\.mtl$/,
      use: "raw-loader",
    });

    // Add rule for .obj files
    config.module.rules.push({
      test: /\.obj$/,
      use: "raw-loader", // Use raw-loader to load .obj files as plain text
    });

    return config;
  },
};

export default nextConfig;
