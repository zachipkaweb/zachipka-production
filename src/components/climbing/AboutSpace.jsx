import Image from "next/image";
import { BLUR_DATA_URLS } from "@/lib/blurPlaceholders";

const zones = [
  { name: "БОЛДЕРИНГУ", img: "/images/climbing/Routes-b.webp" },
  { name: "МОТУЗОК", img: "/images/climbing/Routes-c.webp" },
  { name: "РОЗМИНКИ", img: "/images/climbing/Routes-t.webp" },
];

export default function AboutSpace() {
  return (
    <section id="AboutSpace" className="relative py-12 sm:py-16 md:py-24 lg:py-32 w-full flex justify-center overflow-hidden text-white">
      <Image 
        src="/images/climbing/AboutSpace-hero.webp" 
        alt="Простір скеледрому Зачіпка" 
        fill
        quality={80}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URLS.aboutSpaceHero}
        sizes="(max-width: 768px) 250vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="w-full flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col gap-3 md:gap-4">
            <h3 className="text-yellow uppercase">ПРО ПРОСТІР</h3>
            <h2 className="text-white">
              ПРОСТІР ДЛЯ<br />
              РІЗНИХ ФОРМАТІВ
            </h2>
          </div>
          
          <div className="flex flex-col gap-3 text-white">
            <p>
              Наш зал — це продуманий простір для різних форматів тренувань.
            </p>
            <p>У нас є зони:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 my-2">
            {zones.map((zone) => (
              <div 
                key={zone.name} 
                className="relative aspect-16/10 sm:aspect-4/3 md:aspect-square overflow-hidden bg-neutral-900"
              >
                <Image 
                  src={zone.img} 
                  alt={`Зона для ${zone.name}`} 
                  fill 
                  quality={75}
                  sizes="(max-width: 768px) 150vw, 50vw"
                  className="object-cover" 
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6">
                  <span className="block text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold uppercase tracking-wide">
                    {zone.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-white max-w-2xl">
            <p>
              Простір організований так, щоб новачкам було комфортно почати, а досвідченим — не нудно тренуватись.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
