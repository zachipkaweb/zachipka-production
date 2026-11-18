import Link from "next/link";
import { verifySession } from "@/lib/auth";
import EventsForm from "./EventsForm";
import { getEvents } from "@/lib/events";
import { redirect } from "next/navigation";

export const metadata = {
  title: 'Редагування подій — Адмін-панель',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminEventsPage() {
  const { isAuth } = await verifySession(); 

  if (!isAuth) {
    redirect('/admin/login');
  }

    const upcomingEvents = await getEvents('upcoming');
    const pastEvents = await getEvents('past');

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
          Редагування подій
        </h1>
      </div>
    <EventsForm initialUpcoming={upcomingEvents} initialPast={pastEvents} />
    </div>
  );
}