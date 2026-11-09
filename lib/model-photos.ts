// On-model product photos (made in ChatGPT from the reference sheets in out/chatgpt/).
// File: public/photos/<slug>-<n>.jpg, 1200×1200. The first photo leads the product page,
// the shop card and the ad. Only add a photo after checking the print matches the real design.
export const MODEL_PHOTOS: Record<string, number> = {
  'not-old-seasoned': 1,
  'coffee-hot-flashes-spite': 1,
  'fluent-in-sarcasm': 1,
  'fine-wine-cheap-tequila': 1,
  'vintage-knees': 1,
  'peaked-honey': 1,
  'too-old-for-drama': 2,
  'status-report': 1,
  'dont-do-mornings': 1,
  'say-what-im-thinking': 1,
};

export function modelPhotos(slug: string): { src: string; title: string }[] {
  const n = MODEL_PHOTOS[slug] ?? 0;
  return Array.from({ length: n }, (_, i) => ({ src: `/photos/${slug}-${i + 1}.jpg`, title: '' }));
}
