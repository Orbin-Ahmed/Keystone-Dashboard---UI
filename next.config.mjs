/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2ajyyavf56otu.cloudfront.net",
        pathname: "/**",
      },

      { protocol: "https", hostname: "avatar.iran.liara.run", pathname: "/**" },
      { protocol: "https", hostname: "replicate.com", pathname: "/**" },
      { protocol: "https", hostname: "replicate.delivery", pathname: "/**" },

      {
        protocol: "https",
        hostname: "backend.idealhomeuae.com",
        pathname: "/**",
      },

      // Local dev API
      // {
      //   protocol: "http",
      //   hostname: "127.0.0.1",
      //   port: "8000",
      //   pathname: "/media/**",
      // },
      // {
      //   protocol: "http",
      //   hostname: "localhost",
      //   port: "8000",
      //   pathname: "/media/**",
      // },
    ],
  },

  webpack(config, { nextRuntime }) {
    if (nextRuntime === "nodejs") {
      config.resolve.alias.canvas = false;
    }
    return config;
  },
};

export default nextConfig;
