/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  // Vercel uses its own serverless functions, so we don't need standalone
  output: process.env.VERCEL ? undefined : "standalone",
};

module.exports = nextConfig;
