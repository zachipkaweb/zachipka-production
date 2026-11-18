import Hero from "@/components/events/Hero";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import PastEvents from "@/components/events/PastEvents";
import { getCachedUpcomingEvents, getCachedPastEvents } from "@/lib/cachedData";
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER_IMAGES } from "../shared-metadata";

export const metadata = {
  title: "Події та змагання — Афіша і виїзди на скелі",
  description:
    "Змагання зі скелелазіння, майстер-класи, дитячі свята, корпоративи та виїзди на скелі в Івано-Франківську. Обирайте подію та бронюйте місце онлайн!",
  keywords: [
    "події скеледром Івано-Франківськ",
    "змагання зі скелелазіння Івано-Франківськ",
    "виїзди на скелі",
    "майстер-клас зі скелелазіння",
    "дитяче свято на скеледромі",
    "корпоратив на скеледромі Івано-Франківськ",
    "Зачіпка події",
  ],
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "Події та змагання — Афіша і виїзди на скелі",
    description:
      "Змагання, майстер-класи, відкриті тренування, дитячі свята та спільні виїзди на скелі від ком'юніті «Зачіпка» в Івано-Франківську.",
    url: "/events",
    siteName: "Скеледром Зачіпка",
    locale: "uk_UA",
    type: "website",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Події та змагання — Афіша і виїзди на скелі",
    description:
      "Розклад найближчих подій, змагань, майстер-класів і виїздів на скелі в Івано-Франківську.",
    images: DEFAULT_TWITTER_IMAGES,
  },
};

export default async function Events() {
  const [upEvents, pastEvents] = await Promise.all([
    getCachedUpcomingEvents(),
    getCachedPastEvents(),
  ]);
  const activeUpEvents = upEvents.filter((e) => e.isActive);
  const sliderPastEvents = pastEvents.filter((e) => e.isFeatured && e.coverImage);
  const hasUpcoming = activeUpEvents.length > 0;

  const featuredEvent = hasUpcoming
    ? activeUpEvents[0]
    : sliderPastEvents[0] || null;

  return (
    <>
      <Hero featuredEvent={featuredEvent} isUpcoming={hasUpcoming} />
      <UpcomingEvents upEvents={upEvents} isUpcoming={hasUpcoming} />
      <PastEvents pastEvents={sliderPastEvents} />
    </>
  );
}
