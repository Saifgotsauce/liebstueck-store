// Builds preview/liebstueck-preview.html: one self-contained file (JS, CSS and fonts inlined)
// with the whole storefront, hash-routed, checkout disabled. Good for sharing a look at the shop.
//   npx tsx scripts/build-preview.ts
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';

const root = process.cwd();
const outDir = path.join(root, 'preview');

async function main() {
  const js = await build({
    entryPoints: [path.join(root, 'preview/entry.tsx')],
    bundle: true,
    write: false,
    minify: true,
    format: 'iife',
    target: 'es2020',
    jsx: 'automatic',
    alias: { 'next/link': path.join(root, 'preview/next-link-shim.tsx') },
    plugins: [
      {
        // A one-file page can't load /mockups/… files, so Printful photos are embedded as data URIs.
        name: 'inline-mockups',
        setup(b) {
          b.onLoad({ filter: /printful-mockups\.json$/ }, (args) => {
            const json = fs.readFileSync(args.path, 'utf8').replace(/"\/mockups\/([^"]+)"/g, (_, rel) => {
              const file = path.join(root, 'public', 'mockups', rel);
              return fs.existsSync(file) ? `"data:image/webp;base64,${fs.readFileSync(file).toString('base64')}"` : 'null';
            });
            return { contents: json, loader: 'json' };
          });
        },
      },
    ],
    define: {
      'process.env.NODE_ENV': '"production"',
      'process.env.NEXT_PUBLIC_DEMO': '"1"',
      'process.env.NEXT_PUBLIC_SITE_URL': '"https://www.deine-domain.de"',
      'process.env.NEXT_PUBLIC_META_PIXEL_ID': '""',
    },
    logLevel: 'warning',
  });
  const script = js.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

  const cssFile = path.join(outDir, '.preview.css');
  execSync(`npx @tailwindcss/cli -i app/globals.css -o ${cssFile} --minify`, { cwd: root, stdio: 'ignore' });
  let css = fs.readFileSync(cssFile, 'utf8');
  fs.unlinkSync(cssFile);
  css = css.replace(/url\((["']?)\/fonts\/([^"')]+\.ttf)\1\)/g, (_, _q, file) => {
    const b64 = fs.readFileSync(path.join(root, 'public/fonts', file)).toString('base64');
    return `url(data:font/ttf;base64,${b64})`;
  });

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Liebstück – Shop-Vorschau</title>
<style>${css}</style>
</head>
<body class="min-h-screen bg-white antialiased">
<div id="root"></div>
<script>${script}</script>
</body>
</html>`;
  const out = path.join(outDir, 'liebstueck-preview.html');
  fs.writeFileSync(out, html);
  console.log(`wrote ${path.relative(root, out)} (${(html.length / 1024).toFixed(0)} KB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
