/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...(config.externals || []), { 'pg-native': 'pg-native' }];
    return config;
  },
}

module.exports = nextConfig 