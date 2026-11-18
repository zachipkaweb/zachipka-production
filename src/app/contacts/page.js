import Hero from "@/components/contacts/Hero";
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER_IMAGES } from "../shared-metadata";

export const metadata = {
  title: "Контакти скеледрому — Телефон, соцмережі та запис",
  description:
    "Телефон, пошта, Instagram, Telegram та форма зворотного зв’язку скеледрому в Івано-Франківську. Напишіть нам — допоможемо обрати формат тренувань!",
  keywords: [
    "контакти скеледром Зачіпка",
    "телефон скеледром Івано-Франківськ",
    "записатися на скелелазіння Івано-Франківськ",
    "Зачіпка Івано-Франківськ контакти",
    "інстаграм Зачіпка скеледром",
    "телеграм Зачіпка скеледром",
  ],
  alternates: {
    canonical: "/contacts",
  },
  openGraph: {
    title: "Контакти скеледрому — Телефон, соцмережі та запис",
    description:
      "Маєте питання або хочете записатись на перше заняття в Івано-Франківську? Телефонуйте або пишіть нам у форму зворотного зв’язку.",
    url: "/contacts",
    siteName: "Скеледром Зачіпка",
    locale: "uk_UA",
    type: "website",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Контакти скеледрому — Телефон, соцмережі та запис",
    description:
      "Телефон +38 068 812 33 19, соцмережі та форма зворотного зв’язку скеледрому Зачіпка в Івано-Франківську.",
    images: DEFAULT_TWITTER_IMAGES,
  },
};

export default function Contacts() {
  return (
    <>
      <Hero />
    </>
  );
}
