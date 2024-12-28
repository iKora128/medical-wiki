/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "node:stream": require.resolve("stream-browserify"),
        "node:crypto": require.resolve("crypto-browserify"),
        "node:http": require.resolve("stream-http"),
        "node:https": require.resolve("https-browserify"),
        "node:os": require.resolve("os-browserify/browser"),
        "node:url": require.resolve("url"),
        "node:buffer": require.resolve("buffer"),
        "node:util": require.resolve("util"),
        "node:assert": require.resolve("assert"),
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "url": require.resolve("url"),
        "buffer": require.resolve("buffer"),
        "assert": require.resolve("assert"),
        "util": require.resolve("util"),
      }
    }
    return config
  },
}

module.exports = nextConfig 