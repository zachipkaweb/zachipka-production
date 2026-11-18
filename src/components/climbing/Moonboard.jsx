import Image from "next/image";
import { BLUR_DATA_URLS } from "@/lib/blurPlaceholders";

export default function Moonboard() {
  return (
    <>
    <section className="relative min-h-[calc(var(--vh,1svh)*80)] py-16 sm:py-24 md:py-32 lg:py-48 w-full overflow-hidden text-white">
      <Image 
        src="/images/climbing/Moonboard-hero.webp" 
        alt="Мунборд тренувальна зона" 
        fill
        quality={95}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URLS.moonboardHero}
        sizes="(max-width: 768px) 250vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="w-full lg:w-[60%] flex flex-col gap-6 sm:gap-8">
          <h3 className="text-orange uppercase">Для тих, хто хоче більше</h3>
            <h2 className="text-white uppercase">ТРЕНУЙСЯ. <br /> Долай. <br /> прогресуй.</h2>
          
          <div className="flex flex-col gap-6 max-w-2xl">
            <p>
             Мунборд — це тренувальна зона для тих, хто хоче прокачати силу, техніку та витривалість. Фіксований кут і стандартизовані зачіпки дозволяють працювати над конкретними рухами та порівнювати свій прогрес.
            </p>
          </div>
        </div>
      </div>
      
    </section>
    <div className="flex container mx-auto px-6 flex-col md:flex-row justify-between md:items-end my-10 md:my-16 gap-4 md:gap-8">
          <h4 className="text-4xl font-bold mb-2 uppercase leading-none text-gray sm:text-5xl lg:text-6xl">
            галерея
          </h4>
          <p className="text-gray max-w-xl">
            Наш скеледром — це не лише маршрути, а цілий простір для руху й
            відпочинку. Зазирни всередину
          </p>
        </div>
    </>
  );
}
