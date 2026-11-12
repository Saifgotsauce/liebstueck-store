/** @type {import('next').NextConfig} */
const isDemoExport = process.env.DEMO_EXPORT === '1';

const nextConfig = {
  // Native PNG renderer for print files must not be bundled.
  serverExternalPackages: ['@resvg/resvg-js'],
  // Make sure the print fonts ship with the serverless function that renders print files.
  outputFileTracingIncludes: {
    '/api/print-file': ['./assets/fonts/**/*'],
  },
  poweredByHeader: false,
  ...(isDemoExport
    ? { output: 'export', trailingSlash: true, images: { unoptimized: true } }
    : {
        // Files in /public are otherwise re-checked with the server on every single page view.
        // Fonts never change; photos may be replaced under the same name, so they keep for a day
        // and refresh in the background after that.
        async headers() {
          return [
            { source: '/fonts/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=31536000' }] },
            { source: '/:dir(photos|mockups|lifestyle)/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=2592000' }] },
          ];
        },
      }),
};

export default nextConfig;
