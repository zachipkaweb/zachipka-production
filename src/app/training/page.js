import Hero from "@/components/training/Hero";
import PopularPackages from "@/components/training/PopularPackages";
import Sections from "@/components/training/Sections";
import Subscriptions from "@/components/training/Subscriptions";
import Certificate from "@/components/training/Certificate";
import { getCachedTrainingPrices } from "@/lib/cachedData";
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER_IMAGES } from "../shared-metadata";

export const metadata = {
  title: "Тренування зі скелелазіння — Секції та абонементи",
  description:
    "Перше заняття з інструктором, дитячі й дорослі секції, абонементи та подарункові сертифікати в Івано-Франківську. Запишіться на пробне тренування!",
  keywords: [
    "тренування зі скелелазіння Івано-Франківськ",
    "секція скелелазіння для дітей Івано-Франківськ",
    "абонемент у скеледром Івано-Франківськ",
    "пробне заняття на скеледромі",
    "індивідуальне тренування зі скелелазіння",
    "подарунковий сертифікат скеледром",
    "ціни на скеледром Зачіпка",
  ],
  alternates: {
    canonical: "/training",
  },
  openGraph: {
    title: "Тренування зі скелелазіння — Секції та абонементи",
    description:
      "Від першого знайомства з інструктором до регулярних тренувань у секціях і безлімітних абонементів в Івано-Франківську. Оберіть свій формат!",
    url: "/training",
    siteName: "Скеледром Зачіпка",
    locale: "uk_UA",
    type: "website",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Тренування зі скелелазіння — Секції та абонементи",
    description:
      "Перше заняття з інструктором, дитячі та дорослі секції, абонементи й подарункові сертифікати в Івано-Франківську.",
    images: DEFAULT_TWITTER_IMAGES,
  },
};

export default async function Training() {
  const { packages, sections, subscriptions } = await getCachedTrainingPrices();

  return (
    <>
      <Hero />
      <PopularPackages packagesData={packages} />
      <Sections sectionsData={sections} />
      <Subscriptions subscriptionsData={subscriptions} />
      <Certificate />
    </>
  );
}