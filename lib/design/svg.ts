import { DESIGN_H, DESIGN_W, type DesignTemplate, type FieldValues, type Palette } from './types';

/** The design on its own (transparent background), as SVG elements in design space. */
export function designMarkup(t: DesignTemplate, values: FieldValues, palette: Palette) {
  return t.render(values, palette);
}

/**
 * A complete print file: the 3:4 design scaled to fit Printful's print area for the
 * garment, centred horizontally and aligned to the top (where a chest print sits).
 */
export function printFileSvg(t: DesignTemplate, values: FieldValues, palette: Palette, width: number, height: number) {
  const scale = Math.min(width / DESIGN_W, height / DESIGN_H);
  const w = DESIGN_W * scale;
  const h = DESIGN_H * scale;
  const x = (width - w) / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<svg x="${x}" y="0" width="${w}" height="${h}" viewBox="0 0 ${DESIGN_W} ${DESIGN_H}">` +
    designMarkup(t, values, palette) +
    `</svg></svg>`
  );
}
