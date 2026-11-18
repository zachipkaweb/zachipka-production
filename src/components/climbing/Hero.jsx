
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-svh w-full overflow-hidden">
      <Image
        className="absolute inset-0 h-full w-full object-cover"
        src="/images/climbing/hero.webp"
        alt="Скеледром Зачіпка"
        fill
        priority
        quality={95}
        sizes="(max-width: 768px) 250vw, 100vw"
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-noise-animated opacity-[0.06]" />
      </div>
      <div className="container relative z-10 mx-auto flex h-full flex-col items-start justify-end gap-8 px-6 pb-10 text-white sm:pb-16">
        <h1 className="text-4xl uppercase leading-tight sm:text-5xl lg:text-6xl">
            СКЕЛЕДРОМ
          </h1>
          <p className="max-w-xl text-sm sm:text-base">
             Місце, де можна познайомитися зі скелелазінням, спробувати свої сили на нових маршрутах і просто добре провести час. <br /><br />
Маршрути для різного рівня підготовки, усе необхідне для тренувань і люди, які завжди готові підказати, допомогти та підтримати.
          </p>
      </div>
    </section>
  );
}