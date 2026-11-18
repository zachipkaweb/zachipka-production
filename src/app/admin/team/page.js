import Link from 'next/link';
import { verifySession } from '@/lib/auth';
import { getTeam } from '@/lib/team';
import TeamForm from './TeamForm';
import { redirect } from 'next/navigation'; 

export const metadata = {
  title: 'Керування командою — Адмін-панель',
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

  const teamData = await getTeam();

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
          Редагування слайдера команди
        </h1>
      </div>
        <TeamForm initialTeam={teamData} />
    </div>
  );
}