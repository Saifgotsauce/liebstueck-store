import CartView from '@/components/pages/CartView';

export const metadata = { title: 'Warenkorb', robots: { index: false } };

export default function Warenkorb() {
  return <CartView />;
}
