// Small vector ornaments used by the designs. Everything is plain SVG so it renders
// identically in browsers and in the server-side print renderer (resvg).

const r = (n: number) => Math.round(n * 100) / 100;

const HEART_D =
  'M0,0.42 C-0.08,0.34 -0.5,0.08 -0.5,-0.18 C-0.5,-0.36 -0.36,-0.46 -0.24,-0.46 C-0.12,-0.46 -0.04,-0.4 0,-0.3 C0.04,-0.4 0.12,-0.46 0.24,-0.46 C0.36,-0.46 0.5,-0.36 0.5,-0.18 C0.5,0.08 0.08,0.34 0,0.42 Z';

/** Heart centred on (cx, cy), `size` = overall width. */
export function heart(cx: number, cy: number, size: number, fill: string) {
  return `<path transform="translate(${r(cx)} ${r(cy)}) scale(${r(size)})" d="${HEART_D}" fill="${fill}"/>`;
}

export function star(cx: number, cy: number, outer: number, inner: number, fill: string, points = 5) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    pts.push(`${r(cx + rad * Math.cos(a))},${r(cy + rad * Math.sin(a))}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
}

export function hline(x1: number, x2: number, y: number, stroke: string, width = 6) {
  return `<line x1="${r(x1)}" y1="${r(y)}" x2="${r(x2)}" y2="${r(y)}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
}

export function circle(cx: number, cy: number, radius: number, fill: string) {
  return `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(radius)}" fill="${fill}"/>`;
}

export function triangle(apexX: number, apexY: number, baseY: number, halfWidth: number, fill: string) {
  return `<polygon points="${r(apexX)},${r(apexY)} ${r(apexX + halfWidth)},${r(baseY)} ${r(apexX - halfWidth)},${r(baseY)}" fill="${fill}" stroke="${fill}" stroke-width="10" stroke-linejoin="round"/>`;
}
