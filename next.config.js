/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "http2": false,
      "http": false,
      "https": false,
      "url": false,
      "events": false,
      "fs": false,
      "net": false,
      "tls": false,
      "child_process": false,
    }
    return config
  },
}

export default nextConfig 