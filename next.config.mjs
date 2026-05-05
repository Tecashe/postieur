/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: '*.clerk.com' },
    ],
  },
  allowedDevOrigins: ['vm-8gdt45byq368zc71dizwh9yc.vusercontent.net'],
}

export default nextConfig
