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
    : {}),
};

export default nextConfig;
