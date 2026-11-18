import Image from "next/image";

export default function AboutClimbing() {
  return (
    <section id="AboutClimbing" className="relative py-12 sm:py-16 md:py-24 lg:py-32 w-full z-20">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="container relative z-10 mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 lg:gap-16">
        <div className="w-full lg:w-1/2 flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col gap-4 sm:gap-6 max-w-xl">
            <h3 className="text-red uppercase">Про рух</h3>
            <h2 className="text-gray">СКЕЛЕЛАЗІННЯ</h2>
            <p>Скелелазіння — це поєднання руху, сили та концентрації. Тут важливо не лише дістатися вершини, а й знайти свій спосіб пройти маршрут. <br /> <br />
У залі можна опанувати основи, вдосконалити техніку, спробувати складніші маршрути та підготуватися до лазіння на справжніх скелях.</p>
          </div>
        </div>

      </div>
      <div className="relative lg:absolute lg:inset-0 lg:w-full lg:max-w-[1800px] lg:mx-auto pointer-events-none z-10">
        <div className="relative w-[90%] sm:w-[75%] md:w-[55%] md:max-w-105 ms-auto pe-4 sm:pe-6 lg:pe-0 mt-6 sm:mt-8 lg:mt-0 lg:absolute lg:right-[-10%] lg:top-[-10%] xl:top-[-20%] lg:w-[48vw] xl:w-[75vw] lg:max-w-125 xl:max-w-185 2xl:max-w-215">
          <Image
            src="/images/climbing/AboutClimbing.webp"
            alt="Скелелазіння"
            width={2560}
            height={2097}
            sizes="(max-width: 768px) 90vw, (max-width: 1280px) 50vw, 860px"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
