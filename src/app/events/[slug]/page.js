// ============================================================================
// Dynamic Past Event Details Page (`/events/[slug]`)
// Generates SEO metadata, OpenGraph tags, and renders event cover, story, & photo gallery.
// ============================================================================

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCachedPastEventBySlug } from "@/lib/cachedData";
import { formatEventDate } from "@/lib/dates";
import { isCloudinaryUrl, optimizeCloudinaryUrl } from "@/lib/cloudinaryLoader";
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER_IMAGES } from "../../shared-metadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await getCachedPastEventBySlug(slug);

  if (!event || !event.isFeatured || !event.coverImage) {
    return {
      title: "Подію не знайдено",
      robots: { index: false, follow: false },
    };
  }

  const pageTitle = `${event.title} — Фотозвіт та історія події`;
  const rawSummary = (event.shortDescription || event.content || "")
    .replace(/\s+/g, " ")
    .trim();

  const description = rawSummary
    ? `${rawSummary.slice(0, 95)} — подія скеледрому в Івано-Франківську. Перегляньте фотозвіт!`.slice(0, 155)
    : `Фотозвіт і підсумки події «${event.title}» у скеледромі Зачіпка в Івано-Франківську. Дивіться галерею та долучайтеся до наших наступних заходів!`;

  return {
    title: pageTitle,
    description,
    keywords: [
      event.title,
      "події скеледром Івано-Франківськ",
      "змагання зі скелелазіння",
      "фотозвіт Зачіпка",
      "скелелазіння Івано-Франківськ",
      "ком'юніті Зачіпка",
    ],
    alternates: {
      canonical: `/events/${event.slug}`,
    },
    openGraph: {
      title: pageTitle,
      description,
      url: `/events/${event.slug}`,
      siteName: "Скеледром Зачіпка",
      locale: "uk_UA",
      type: "website",
      images: event.coverImage ? [event.coverImage] : DEFAULT_OG_IMAGES,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: event.coverImage ? [event.coverImage] : DEFAULT_TWITTER_IMAGES,
    },
  };
}

export default async function PastEventDetailsPage({ params }) {
  const { slug } = await params;
  const event = await getCachedPastEventBySlug(slug);
  if (!event || !event.isFeatured || !event.coverImage) {
    notFound();
  }

  return (
    <main className="relative min-h-svh bg-white pt-28">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />
      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <Link
          href="/events#past-events"
          className="text-xs uppercase font-bold tracking-wider text-gray/60 hover:text-gray mb-8 inline-block transition-colors"
        >
          Назад до всіх подій
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start mb-14 sm:mb-20">
          <div className="md:col-span-5 lg:col-span-4 w-full max-w-md mx-auto md:mx-0">
            <div className="relative aspect-3/4 w-full overflow-hidden bg-black">
              <Image
                src={optimizeCloudinaryUrl(event.coverImage, 1200)}
                unoptimized={isCloudinaryUrl(event.coverImage)}
                alt={event.title}
                fill
                priority
                quality={90}
                sizes="(max-width: 768px) 150vw, 500px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-center gap-4 sm:gap-6">
            <span className="text-orange font-bold text-sm sm:text-base uppercase tracking-wider">
              {formatEventDate(event.eventDate, event.endDate, { mode: 'long' })}
            </span>

            <h1 className="text-gray text-4xl sm:text-6xl lg:text-7xl font-bold uppercase leading-none">
              {event.title}
            </h1>

             <div className="w-full mb-16 sm:mb-24">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray/40 mb-4">
            Про подію
          </h3>
          <div className="text-base sm:text-lg text-gray/85 leading-relaxed whitespace-pre-line max-w-4xl">
            {event.content}
          </div>
        </div>
          </div>
        </div>
      </div>
      {event.gallery?.length > 0 && (
        <section className="relative z-10 mt-12 sm:mt-16">
          <div className="container mx-auto px-4 sm:px-6 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray/40">
              Фотозвіт
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {event.gallery.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative w-full h-[50svh] md:h-[65svh] lg:h-[70svh] overflow-hidden bg-black"
              >
                <Image
                  src={optimizeCloudinaryUrl(imgUrl, 1600)}
                  unoptimized={isCloudinaryUrl(imgUrl)}
                  alt={`${event.title} фото ${idx + 1}`}
                  fill
                  quality={90}
                  sizes="(max-width: 768px) 150vw, 60vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}