import Link from 'next/link';
import LegalDoc from '@/components/LegalDoc';
import { widerrufsbelehrungHtml } from '@/lib/legal-de';
import { ROUTES } from '@/lib/locale';

export const metadata = { title: 'Widerrufsbelehrung' };

export default function Widerrufsbelehrung() {
  return (
    <LegalDoc title="Widerrufsbelehrung" html={widerrufsbelehrungHtml}>
      <p className="mt-5">
        <Link href={ROUTES.de.withdraw} className="btn btn-violet">
          Vertrag widerrufen
        </Link>
      </p>
    </LegalDoc>
  );
}
