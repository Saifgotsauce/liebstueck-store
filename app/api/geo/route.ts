// Visitor's country from Vercel's edge (no cookies, nothing stored). Used only to suggest
// the right store: German visitors on the US site and US visitors on the German site.
export const runtime = 'edge';

export function GET(req: Request) {
  const country = req.headers.get('x-vercel-ip-country') ?? '';
  return Response.json({ country }, { headers: { 'Cache-Control': 'private, no-store' } });
}
