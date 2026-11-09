import { DESIGN_H, DESIGN_W, type DesignTemplate, type FieldValues, type Palette } from './types';

/** The design on its own (transparent background), as SVG elements in design space. */
export function designMarkup(t: DesignTemplate, values: FieldValues, palette: Palette) {
  return t.render(values, palette);
}

/** Widest the design may print, in inches – keeps it chest-sized on Printful's larger 15″ × 18″ areas. */
export const MAX_PRINT_WIDTH_IN = 12;

/**
 * Where the 3:4 design sits inside a print file of the given size: as large as fits
 * (but at most 12″ wide), centred horizontally, aligned to the top.
 */
export function designRect(width: number, height: number, dpi = 150) {
  const scale = Math.min(width / DESIGN_W, height / DESIGN_H, (MAX_PRINT_WIDTH_IN * dpi) / DESIGN_W);
  const w = DESIGN_W * scale;
  const h = DESIGN_H * scale;
  return { x: (width - w) / 2, y: 0, w, h };
}

/** A complete print file for Printful (transparent background, design placed by designRect). */
export function printFileSvg(t: DesignTemplate, values: FieldValues, palette: Palette, width: number, height: number, dpi = 150) {
  const { x, w, h } = designRect(width, height, dpi);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<svg x="${x}" y="0" width="${w}" height="${h}" viewBox="0 0 ${DESIGN_W} ${DESIGN_H}">` +
    designMarkup(t, values, palette) +
    `</svg></svg>`
  );
}
