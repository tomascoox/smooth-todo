/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.ignoreWarnings = [
        { module: /node_modules/, message: /NODE_TLS_REJECT_UNAUTHORIZED/ },
      ];
    }
    return config;
  },
};

export default nextConfig;
