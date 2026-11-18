import { verifySession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Панель керування — Адмін-панель',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const { isAuth } = await verifySession();

  if (!isAuth) {
    redirect('/admin/login');
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h3 className="text-purple uppercase mb-3 font-bold text-xs sm:text-sm tracking-wider">
          Адмін-панель
        </h3>
        <h1 className="text-gray uppercase font-bold text-3xl sm:text-5xl leading-none mb-3">
          Панель керування
        </h1>
        <p className="text-gray/80 text-sm sm:text-base">
          Ком&apos;юніті-простір і скеледром «Зачіпка»
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Link
          href="/admin/training"
          className="p-6 border-2 border-gray hover:bg-yellow transition-colors group flex flex-col justify-between min-h-40"
        >
          <div>
            <h4 className="text-3xl font-bold uppercase mb-2 text-gray">
              Ціни на тренування
            </h4>
            <p className="text-sm text-gray/80">
              Редагування вартості пакетів, секцій та абонементів на сторінці тренувань.
            </p>
          </div>
        </Link>
        <Link
          href="/admin/events"
          className="p-6 border-2 border-gray hover:bg-yellow transition-colors group flex flex-col justify-between min-h-40"
        >
          <div>
            <h4 className="text-3xl font-bold uppercase mb-2 text-gray">
              Події
            </h4>
            <p className="text-sm text-gray/80">
              Редагування майбутніх подій, минулих подій та їх наповнення.
            </p>
          </div>
        </Link>
        <Link
          href="/admin/team"
          className="p-6 border-2 border-gray hover:bg-yellow transition-colors group flex flex-col justify-between min-h-40"
        >
          <div>
            <h4 className="text-3xl font-bold uppercase mb-2 text-gray">
              Команда
            </h4>
            <p className="text-sm text-gray/80">
              Редагування слайдеру команди.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}