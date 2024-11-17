/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Required for static export
  basePath: process.env.NODE_ENV === 'production' ? '/cryptowatchlist' : '',
  images: {
    unoptimized: true, // Required for static export
  },
}

module.exports = nextConfig
