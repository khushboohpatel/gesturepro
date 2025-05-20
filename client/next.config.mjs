/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "lh3.googleusercontent.com"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  experimental: {
    allowedDevOrigins: ['10.250.116.36'],
  },
};

export default nextConfig;
