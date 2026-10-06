import nextPWA from '@ducanh2912/next-pwa';

const withPWA = nextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: false,
  reloadOnOnline: true,
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^\/api\/.*$/i,
        handler: 'NetworkOnly',
      },
      {
        urlPattern: ({ request }) => request.destination === 'document',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'documents',
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

export default withPWA({
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),
});
