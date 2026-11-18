import Link from 'next/link';
import { verifySession } from '@/lib/auth';
import { getTrainingPrices } from '@/lib/prices';
import PricesForm from './PricesForm';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ціни на тренування — Адмін-панель',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminTrainingPricesPage() {
  const { isAuth } = await verifySession();

  if (!isAuth) {
    redirect('/admin/login');
  }

  const pricesData = await getTrainingPrices({ includeInactive: true });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin"
          className="text-xs uppercase font-bold tracking-wider text-gray/60 hover:text-gray transition-colors mb-8 inline-block"
        >
          Назад до дашборду
        </Link>
        <h1 className="text-gray uppercase font-bold text-3xl sm:text-4xl leading-none">
          Редагування цін на тренування
        </h1>
      </div>

      <PricesForm initialData={pricesData} />
    </div>
  );
}
