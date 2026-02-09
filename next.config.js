/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure server-side only packages are properly handled
  serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  // Webpack configuration for Node.js modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize Node.js modules that shouldn't be bundled
      config.externals = config.externals || []
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse',
        'mammoth': 'commonjs mammoth',
      })
    }
    return config
  },
}

module.exports = nextConfig

