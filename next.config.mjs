/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,
};
export default nextConfig;
