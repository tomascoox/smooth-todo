/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;
