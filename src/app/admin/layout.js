import Link from 'next/link';
import Image from 'next/image';
import { logoutAction } from './actions';
import { verifySession } from '@/lib/auth';

export const metadata = {
  title: 'Адмін-панель',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }) {
  const { isAuth } = await verifySession();

  return (
    <div className="min-h-screen bg-white text-gray flex flex-col font-sans relative">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <header className="relative z-10 bg-white/90 backdrop-blur-sm px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/admin" className="flex items-center gap-3 group">
            <Image
              src="/logo.svg"
              alt="Зачіпка"
              width={32}
              height={45}
              className="h-8 w-auto transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-bold uppercase tracking-tight text-gray">
              ЗАЧІПКА
            </span>
            <span className="bg-yellow text-gray text-xs font-bold uppercase px-2 py-0.5">
              ADMIN
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-xs uppercase tracking-wider font-bold text-gray/70 hover:text-gray transition-colors"
          >
            ← На сайт
          </Link>

          {isAuth && (
            <form action={logoutAction}>
              <button
                type="submit"
                className="bg-gray hover:bg-red text-white text-xs uppercase font-bold tracking-wider px-3.5 py-2 transition-colors cursor-pointer"
              >
                Вийти
              </button>
            </form>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}