// Makes the small copies of photos that phones download instead of the full-size files.
//
//   public/photos/<name>.jpg (1200×1200)      → <name>-480.webp, <name>-800.webp, <name>-1200.webp
//   public/mockups/<garment>/<file>.webp       → <file>-560.webp (shop grid tiles)
//
// Printful hands out the same shirt photo under several file names. Those are listed under "same",
// so the browser downloads the picture once instead of once per colour.
//
// data/image-variants.json lists what exists; lib/model-photos.ts and lib/mockups.ts only point at a
// small copy that is in that list, so a missing file can never show as a broken picture.
//
// Runs before every build (npm "prebuild"). A copy is remade when its source file changed
// (the list remembers each source's fingerprint) or with --force.
// Why it matters: most visitors come from a Facebook ad on a phone, and the page has to show before
// she swipes on. See docs/design-rules.md §5b.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');
const force = process.argv.includes('--force');
const PHOTO_WIDTHS = [480, 800, 1200];
const MOCKUP_WIDTH = 560;
const VARIANT = /-(\d{3,4})\.webp$/;

async function main() {
  let sharp: typeof import('sharp');
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.warn('optimize-images: sharp is not installed, keeping the list as it is.');
    return;
  }

  type Manifest = { photos: Record<string, number[]>; mockups: { same: Record<string, string>; small: Record<string, string> }; sources: Record<string, string> };
  const file = path.join(root, 'data', 'image-variants.json');
  const before: Partial<Manifest> = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const manifest: Manifest = { photos: {}, mockups: { same: {}, small: {} }, sources: {} };
  const md5 = (abs: string) => crypto.createHash('md5').update(fs.readFileSync(abs)).digest('hex');
  const pub = (abs: string) => '/' + path.relative(path.join(root, 'public'), abs).split(path.sep).join('/');
  /** True when the source is new or different from last time: its copies must be remade. */
  const changed = (abs: string) => {
    const hash = (manifest.sources[pub(abs)] = md5(abs));
    return force || before.sources?.[pub(abs)] !== hash;
  };
  let made = 0;

  const photoDir = path.join(root, 'public', 'photos');
  for (const file of fs.existsSync(photoDir) ? fs.readdirSync(photoDir).sort() : []) {
    if (!/\.jpe?g$/i.test(file)) continue;
    const src = path.join(photoDir, file);
    const base = file.replace(/\.jpe?g$/i, '');
    const meta = await sharp(src).metadata();
    const redo = changed(src);
    const widths: number[] = [];
    for (const w of PHOTO_WIDTHS) {
      if (!meta.width || w > meta.width) continue;
      const out = path.join(photoDir, `${base}-${w}.webp`);
      if (redo || !fs.existsSync(out)) {
        await sharp(src).resize({ width: w }).webp({ quality: w >= 1200 ? 74 : 76, effort: 6 }).toFile(out);
        made++;
      }
      widths.push(w);
    }
    if (widths.length) manifest.photos[`/photos/${file}`] = widths;
  }

  const mockupDir = path.join(root, 'public', 'mockups');
  const walk = (dir: string): string[] =>
    fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])) : [];
  const seen = new Map<string, string>();
  for (const src of walk(mockupDir).sort()) {
    if (!src.endsWith('.webp') || VARIANT.test(src)) continue;
    const out = src.replace(/\.webp$/, `-${MOCKUP_WIDTH}.webp`);
    const redo = changed(src);
    const hash = manifest.sources[pub(src)];
    const first = seen.get(hash);
    if (first) {
      manifest.mockups.same[pub(src)] = first;
      if (fs.existsSync(out)) fs.rmSync(out);
      continue;
    }
    seen.set(hash, pub(src));
    const meta = await sharp(src).metadata();
    if (!meta.width || meta.width <= MOCKUP_WIDTH) continue;
    if (redo || !fs.existsSync(out)) {
      await sharp(src).resize({ width: MOCKUP_WIDTH }).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(out);
      made++;
    }
    manifest.mockups.small[pub(src)] = pub(out);
  }

  const next = JSON.stringify(manifest, null, 2) + '\n';
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== next) fs.writeFileSync(file, next);
  console.log(`optimize-images: ${made} new file(s), ${Object.keys(manifest.photos).length} photos and ${Object.keys(manifest.mockups.small).length} mockups listed.`);
}

// Never fail a build over a smaller picture: the full-size files still work.
main().catch((err) => {
  console.warn('optimize-images: skipped –', err instanceof Error ? err.message : err);
});
