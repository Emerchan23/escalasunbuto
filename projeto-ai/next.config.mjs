/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Permitir requisições cross-origin de IPs da rede local
  allowedDevOrigins: [
    'localhost',
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
  ],
}

export default nextConfig
