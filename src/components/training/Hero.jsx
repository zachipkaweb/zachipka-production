import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-svh w-full overflow-hidden">
      <Image
        className="absolute inset-0 h-full w-full object-cover"
        src="/images/training/training-hero.webp"
        alt="Тренування в скеледромі"
        fill
        priority
        quality={80}
        sizes="(max-width: 768px) 250vw, 100vw"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-noise-animated opacity-[0.06]" />
      </div>
      <div className="container relative z-10 mx-auto flex h-full flex-col items-start justify-end gap-6 px-4 sm:px-6 pb-12 sm:pb-16 lg:pb-20 text-white">
        <h1 className="uppercase leading-tight font-bold">
          ОБЕРІТЬ СВІЙ<br />ФОРМАТ ТРЕНУВАНЬ
        </h1>
        <p className="max-w-xl text-white/90">
          Від першого знайомства до регулярних тренувань — у нас є формат для кожного.
        </p>
      </div>
    </section>
  );
}
