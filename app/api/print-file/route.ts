import { GARMENTS, getColor, printfileSize } from '@/lib/catalog';
import { getDesign } from '@/lib/designs';
import { designPalette, getTemplate } from '@/lib/design/templates';
import { validateValues } from '@/lib/design/validate';
import { renderPrintPng } from '@/lib/print/render';
import { verifyPrintParams } from '@/lib/server/print-url';

export const runtime = 'nodejs';

// Renders the print-ready PNG for one order item. Printful downloads it from here
// when the order is created. Only signed URLs (made by the webhook) are accepted.

export async function GET(req: Request) {
  const url = new URL(req.url);
  const data = verifyPrintParams(url.searchParams.get('d') ?? '', url.searchParams.get('s') ?? '');
  if (!data) return new Response('Forbidden', { status: 403 });

  const design = getDesign(data.p);
  const garment = GARMENTS[data.g];
  const color = garment && getColor(garment, data.c);
  if (!design || !garment || !color) return new Response('Not found', { status: 404 });

  const template = getTemplate(design.slug);
  const v = validateValues(template, data.v);
  if (!v.ok) return new Response('Invalid design data', { status: 422 });

  const { width, height, dpi } = printfileSize(garment.key);
  const png = renderPrintPng(template, v.values, designPalette(design.slug, color.ink), width, height, dpi);
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="${design.slug}-${color.key}.png"`,
    },
  });
}
