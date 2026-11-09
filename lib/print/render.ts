// Server-only: renders a print-ready PNG with resvg using the bundled print fonts.
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { printFileSvg } from '../design/svg';
import type { DesignTemplate, FieldValues, Palette } from '../design/types';

export const FONT_FILES = [
  'BebasNeue_400Regular.ttf',
  'DancingScript_700Bold.ttf',
  'PlayfairDisplay_700Bold.ttf',
  'NunitoSans_700Bold.ttf',
  'Fraunces_900Black.ttf',
  'Fraunces_900Black_Italic.ttf',
  'ArchivoBlack_400Regular.ttf',
  'PermanentMarker_400Regular.ttf',
  'CourierPrime_700Bold.ttf',
].map((f) => path.join(process.cwd(), 'assets', 'fonts', f));

export function renderPrintPng(t: DesignTemplate, values: FieldValues, palette: Palette, width: number, height: number, dpi = 150): Buffer {
  const svg = printFileSvg(t, values, palette, width, height, dpi);
  const resvg = new Resvg(svg, {
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'Nunito Sans' },
    fitTo: { mode: 'original' },
    background: 'rgba(0,0,0,0)',
  });
  return resvg.render().asPng();
}
