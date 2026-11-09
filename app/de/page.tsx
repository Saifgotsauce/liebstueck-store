import HomePage from '@/components/pages/HomePage';

export const revalidate = 3600; // hält die Weihnachts-Bestellfrist aktuell

export const metadata = { alternates: { canonical: '/de/', languages: { 'en-US': '/', 'de-DE': '/de/' } } };

export default function Home() {
  return <HomePage locale="de" />;
}
