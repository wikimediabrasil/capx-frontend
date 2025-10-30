const nextConfig = {
  images: {
    domains: ['upload.wikimedia.org', 'commons.wikimedia.org', 'api.badgr.io'],
    remotePatterns: [
      { protocol: 'https', hostname: 'api.badgr.io' },
    ],
  },
};

module.exports = nextConfig;
