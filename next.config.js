/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'pino-pretty': 'commonjs pino-pretty',
      })
    }
    return config
  },
}

export default nextConfig 