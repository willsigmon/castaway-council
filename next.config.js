/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16 has serverActions enabled by default
  // Vercel uses its own serverless functions, so we don't need standalone
  output: process.env.VERCEL ? undefined : "standalone",
  // Transpile workspace packages
  transpilePackages: ["@game-logic", "@schemas"],
};

module.exports = nextConfig;
