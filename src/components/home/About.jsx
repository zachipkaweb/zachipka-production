import Image from "next/image";
import ButtonLink from "../ui/ButtonLink";
import { BLUR_DATA_URLS } from "@/lib/blurPlaceholders";

export default function About() {
  return (
    <section id="about" className="relative min-h-[calc(var(--vh,1svh)*90)] xl:min-h-[calc(var(--vh,1svh)*80)] overflow-hidden">
      <Image
        src="/images/hero/about.webp"
        alt="Про скеледром"
        fill
        quality={95}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URLS.homeAbout}
        sizes="(max-width: 768px) 250vw, 100vw"
        className="object-cover"
      />

      <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-r from-black/90 via-black/50 to-transparent" />

      <div className="relative z-20 flex min-h-[calc(var(--vh,1svh)*60)] xl:min-h-[calc(var(--vh,1svh)*80)] items-center">
        <div className="container mx-auto px-6">
          <div className="flex flex-col gap-6">
            <h3 className="text-yellow">про простір</h3>

            <h2 className="uppercase text-white text-[clamp(40px,6vw,120px)]">
              місце, де <br />
              хочеться бути
            </h2>

            <p className="max-w-md text-white">
              Сучасний скеледром, зона відпочинку, крамниця зі спорядженням та простір, що надихає.
            </p>

            <ButtonLink href="/climbing#AboutSpace" color="white">
              докладніше
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
