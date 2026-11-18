import Hero from "@/components/find-us/Hero";
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER_IMAGES } from "../shared-metadata";

export const metadata = {
  title: "Як нас знайти — Адреса, карта та відео маршруту",
  description:
    "Скеледром Зачіпка в Івано-Франківську на вул. Української Перемоги, 23Д. Інтерактивна Google-карта та відео маршруту до входу. Прокладіть маршрут!",
  keywords: [
    "скеледром Зачіпка адреса",
    "як знайти скеледром Івано-Франківськ",
    "вулиця Української Перемоги 23Д скеледром",
    "скеледром Івано-Франківськ на карті",
    "маршрут до скеледрому Зачіпка",
    "Зачіпка локація",
  ],
  alternates: {
    canonical: "/find-us",
  },
  openGraph: {
    title: "Як нас знайти — Адреса, карта та відео маршруту",
    description:
      "м. Івано-Франківськ, вул. Української Перемоги, 23Д. Зручна карта та відео-інструкція, як швидко зайти до скеледрому «Зачіпка».",
    url: "/find-us",
    siteName: "Скеледром Зачіпка",
    locale: "uk_UA",
    type: "website",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Як нас знайти — Адреса, карта та відео маршруту",
    description:
      "Адреса скеледрому Зачіпка в Івано-Франківську (вул. Української Перемоги, 23Д), Google-карта та відео маршруту до залу.",
    images: DEFAULT_TWITTER_IMAGES,
  },
};

export default function FindUs() {
  return (
    <>
      <Hero />
    </>
  );
}
