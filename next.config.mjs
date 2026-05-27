/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint runs as its own step (`npm run lint`); warnings must not fail the
    // production build / deployment.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
