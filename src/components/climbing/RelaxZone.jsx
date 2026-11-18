import Image from "next/image";

export default function RelaxZone() {
  return (
    <section className="relative pt-12 sm:pt-16 md:pt-24 lg:pt-32 pb-0 w-full bg-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="container relative z-10 mx-auto px-6 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 sm:gap-8 md:gap-12 lg:gap-16">
          <div className="w-full md:w-1/2 flex flex-col gap-3 md:gap-4">
            <h3 className="text-purple uppercase">НЕ ЛИШЕ СПОРТ</h3>
            <h2 className="text-gray">
              ЗОНА<br />
              ВІДПОЧИНКУ
            </h2>
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-3 sm:gap-4 text-gray max-w-lg md:pt-2">
            <p>
              Чекаєш на тренування чи хочеш заземлитися після лазіння?
            </p>
            <p>
              У зоні відпочинку можна перепочити, поспілкуватися із друзями та випити чаю.
            </p>
            <p>
              А якщо зголоднієш — у крамничці знайдеться щось смачне :)
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto h-68 sm:h-88 md:h-125 lg:h-145 mt-4 sm:mt-6 md:mt-8">
          <div className="absolute left-[-10%] sm:left-[-8%] md:left-[-5%] lg:left-[-3%] bottom-0 translate-y-[22%] md:translate-y-[30%] w-[94%] sm:w-[86%] md:w-[78%] lg:w-[74%] xl:w-[70%] max-w-262.5 z-10 pointer-events-none">
            <Image
              src="/images/climbing/chill-one.webp"
              alt="Скелелазний рельєф"
              width={2932}
              height={2484}
              sizes="(max-width: 768px) 94vw, 75vw"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="absolute right-[-10%] sm:right-[-8%] md:right-[-5%] lg:right-[-3%] bottom-0 translate-y-[20%] md:translate-y-[30%] w-[74%] sm:w-[66%] md:w-[60%] lg:w-[56%] xl:w-[52%] max-w-200 z-20 pointer-events-none">
            <Image
              src="/images/climbing/chill-two.webp"
              alt="Зона відпочинку"
              width={2424}
              height={1539}
              sizes="(max-width: 768px) 74vw, 55vw"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
