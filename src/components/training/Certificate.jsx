import Image from "next/image";
import Button from "../ui/Button";
import { BLUR_DATA_URLS } from "@/lib/blurPlaceholders";

export default function Certificate() {
  return (
    <section className="relative h-svh lg:h-svh w-full overflow-hidden text-white flex items-center px-4 py-20 lg:py-0">
      <Image
        src="/images/training/Certificate-hero.webp"
        alt="Подарункові сертифікати"
        fill
        quality={80}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URLS.certificateHero}
        sizes="(max-width: 768px) 250vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl flex flex-col items-start gap-4 sm:gap-6">
          <h4 className="text-yellow text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold uppercase leading-none">
            ПОДАРУНКОВІ<br />СЕРТИФІКАТИ
          </h4>

          <p className="text-white/90 text-sm sm:text-base max-w-xl leading-relaxed">
            Подаруй емоції, активність і нові враження.
            <br className="hidden sm:block" />
            Сертифікат на тренування — це завжди влучна ідея.
          </p>

          <Button
            href="https://zachipka.gymsatellite.com/online_certificates"
            bg="white"
            color="gray"
            uppercase
          >
            Придбати
          </Button>
        </div>
      </div>
    </section>
  );
}
