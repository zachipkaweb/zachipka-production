import Hero from "@/components/climbing/Hero";
import AboutClimbing from "@/components/climbing/AboutClimbing";
import ForEveryone from "@/components/climbing/ForEveryone";
import AboutSpace from "@/components/climbing/AboutSpace";
import RelaxZone from "@/components/climbing/RelaxZone";
import Moonboard from "@/components/climbing/Moonboard";
import Gallery from "@/components/climbing/Gallery";
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER_IMAGES } from "../shared-metadata";

export const metadata = {
  title: "Скеледром в Івано-Франківську — Болдеринг і мотузки",
  description:
    "Зони болдерингу, мотузок, розминки та MoonBoard в Івано-Франківську. Траси для новачків і досвідчених, крамниця та зона відпочинку. Завітайте в зал!",
  keywords: [
    "болдеринг Івано-Франківськ",
    "лазіння з мотузкою Івано-Франківськ",
    "MoonBoard Івано-Франківськ",
    "мунборд Івано-Франківськ",
    "скеледром для початківців",
    "маршрути для скелелазіння",
    "крамниця спорядження для скелелазіння",
  ],
  alternates: {
    canonical: "/climbing",
  },
  openGraph: {
    title: "Скеледром в Івано-Франківську — Болдеринг і мотузки",
    description:
      "Болдеринг, мотузки, зона розминки та інтерактивний стенд MoonBoard. Маршрути для будь-якого рівня підготовки, крамниця спорядження й простір для відпочинку.",
    url: "/climbing",
    siteName: "Скеледром Зачіпка",
    locale: "uk_UA",
    type: "website",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Скеледром в Івано-Франківську — Болдеринг і мотузки",
    description:
      "Болдеринг, мотузки, зона розминки, MoonBoard та затишна зона відпочинку в Івано-Франківську.",
    images: DEFAULT_TWITTER_IMAGES,
  },
};

export default function Climbing() {
  return (
    <>
      <Hero />
      <AboutClimbing />
      <ForEveryone />
      <AboutSpace />
      <RelaxZone />
      <Moonboard />
      <Gallery />
    </>
  );
}
