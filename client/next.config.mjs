import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "lh3.googleusercontent.com", "gesturepro-dev.vercel.app"],
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
  turbopack: {
    rules: {
      // Configure Turbopack rules here
      '*.svg': ['@svgr/webpack'],
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  // Configure allowed development origins
  allowedDevOrigins: ['10.250.109.177', 'localhost', '127.0.0.1', 'gesturepro-dev.vercel.app'],
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Enable PWA in all environments
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})(nextConfig);
