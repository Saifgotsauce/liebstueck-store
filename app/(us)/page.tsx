import HomePage from '@/components/pages/HomePage';

export const revalidate = 3600; // keeps the holiday deadline current

export const metadata = { alternates: { canonical: '/', languages: { 'en-US': '/', 'de-DE': '/de/' } } };

export default function Home() {
  return <HomePage locale="en" />;
}
