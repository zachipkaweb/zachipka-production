import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { DEFAULT_OG_IMAGES, DEFAULT_TWITTER_IMAGES } from "./shared-metadata";

const geologica = localFont({
  src: [
    {
      path: "../fonts/Geologica-Cyrillic.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../fonts/Geologica-CyrillicExt.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../fonts/Geologica-Latin.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../fonts/Geologica-LatinExt.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-geologica",
  display: "swap",
});

const SITE_URL = "https://zachipka.if.ua";

export const viewport = {
  themeColor: "#3f3d3d",
};

const TITLE = "Скеледром Зачіпка — Івано-Франківськ | Болдеринг, мотузки, MoonBoard";
const DESCRIPTION =
  "Скеледром «Зачіпка» в Івано-Франківську: болдеринг, лазіння з мотузкою та MoonBoard. Тренування для дітей і дорослих, абонементи. Запишіться на пробне заняття!";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Скеледром Зачіпка",
  },
  description: DESCRIPTION,
  keywords: [
    "скеледром Івано-Франківськ",
    "скелелазіння Івано-Франківськ",
    "болдеринг Івано-Франківськ",
    "мунборд Івано-Франківськ",
    "MoonBoard Івано-Франківськ",
    "лазіння з мотузкою Івано-Франківськ",
    "секція скелелазіння для дітей Івано-Франківськ",
    "тренування зі скелелазіння",
    "скеледром для початківців",
    "активний відпочинок Івано-Франківськ",
    "Зачіпка скеледром",
    "Промприлад скеледром",
    "zachipka",
  ],
  authors: [{ name: "Скеледром Зачіпка", url: SITE_URL }],
  creator: "Скеледром Зачіпка",
  publisher: "Скеледром Зачіпка",
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    title: "Зачіпка",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Зачіпка — скеледром в Івано-Франківську",
    description:
      "Болдеринг, мотузки та MoonBoard в одному просторі. Тренування для дітей і дорослих, пробне заняття, події та виїзди на скелі.",
    url: SITE_URL,
    siteName: "Скеледром Зачіпка",
    locale: "uk_UA",
    type: "website",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Зачіпка — скеледром в Івано-Франківську",
    description:
      "Болдеринг, мотузки та MoonBoard. Тренування, абонементи, події та виїзди на скелі.",
    images: DEFAULT_TWITTER_IMAGES,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Скеледром Зачіпка",
  alternateName: ["Зачіпка", "Zachipka Climbing Gym"],
  description:
    "Скеледром і ком'юніті-простір в Івано-Франківську: болдеринг, лазіння з мотузкою, MoonBoard, тренування з інструктором, дитячі та дорослі групи.",
  url: SITE_URL,
  inLanguage: "uk",
  telephone: "+380688123319",
  email: "zachipka.skeledrom@gmail.com", 
  image: `${SITE_URL}/images/hero/hero-poster.webp`,
  logo: `${SITE_URL}/logo.svg`,
  priceRange: "₴₴",
  address: {
    "@type": "PostalAddress",
    streetAddress: "вул. Української Перемоги, 23Д",
    addressLocality: "Івано-Франківськ",
    addressRegion: "Івано-Франківська область",
    postalCode: "76000",
    addressCountry: "UA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 48.9148,
    longitude: 24.7111,
  },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Болдеринг", value: true },
    { "@type": "LocationFeatureSpecification", name: "Лазіння з мотузкою", value: true },
    { "@type": "LocationFeatureSpecification", name: "MoonBoard", value: true },
    { "@type": "LocationFeatureSpecification", name: "Тренування для дітей", value: true },
    { "@type": "LocationFeatureSpecification", name: "Тренування для дорослих", value: true },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "12:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "10:00",
      closes: "20:00",
    },
  ],
  sameAs: [
    "https://instagram.com/zachipka_skeledrom",
    "https://t.me/zachipka",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk" className={geologica.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}