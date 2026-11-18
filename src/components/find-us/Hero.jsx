import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full text-white pt-28 sm:pt-36 lg:pt-40">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src="/images/find-us/bg.webp"
          alt="Скелелазіння"
          fill
          priority
          quality={95}
          sizes="(max-width: 768px) 200vw, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <h1 className="text-yellow uppercase leading-tight">
              ЯК НАС ЗНАЙТИ
            </h1>
            <p className="text-yellow">
              м. Івано-Франківськ, вул. Української Перемоги 23Д
            </p>
            <div>
              <a
                href="https://maps.app.goo.gl/M9wgvJzAQrn4PAkcA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm sm:text-base text-white/80 hover:text-white underline underline-offset-4 transition-colors"
              >
                Відкрити в Google Maps
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 mt-8 sm:mt-12 flex justify-center">
          <div className="relative w-full max-w-4xl aspect-488/414">
            <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
              <defs>
                <clipPath id="hold-map-clip" clipPathUnits="objectBoundingBox">
                  <path d="M0.42256 0.03124C0.56543 -0.03894 0.64282 0.02422 0.70235 0.07334C0.76188 0.12246 0.82736 0.05229 0.88094 0.23473C0.93452 0.41718 1.00000 0.33999 1.00000 0.51542C1.00000 0.69084 0.84522 0.65576 0.70235 0.89434C0.55948 1.13292 0.49399 0.88031 0.27968 0.92241C0.06538 0.96451 -0.05369 0.69786 0.02370 0.51542C0.03363 0.47098 0.07966 0.37648 0.18444 0.35402C0.31540 0.32595 0.27968 0.10141 0.42256 0.03124ZM0.30635 0.58213C0.27749 0.58213 0.25410 0.60970 0.25410 0.64372C0.25410 0.67774 0.27749 0.70531 0.30635 0.70531C0.33521 0.70531 0.35861 0.67774 0.35861 0.64372C0.35861 0.60970 0.33521 0.58213 0.30635 0.58213ZM0.66086 0.28502C0.62295 0.28502 0.59221 0.32071 0.59221 0.36473C0.59221 0.40876 0.62295 0.44444 0.66086 0.44444C0.69877 0.44444 0.72951 0.40876 0.72951 0.36473C0.72951 0.32071 0.69877 0.28502 0.66086 0.28502Z" />
                </clipPath>
              </defs>
            </svg>

            <div
              className="w-full h-full overflow-hidden bg-black/20 will-change-transform transform-gpu"
              style={{
                clipPath: "url(#hold-map-clip)",
                WebkitClipPath: "url(#hold-map-clip)",
              }}
            >
              <iframe
                title="Гугл Карта — Скеледром Зачіпка"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2622.0239854570514!2d24.71086717646767!3d48.9149352713397!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4730c1ccd2841f2b%3A0x18b19b781f5fbd2d!2sZachipka!5e0!3m2!1suk!2sua!4v1794140910733!5m2!1suk!2sua"
                className="w-full h-full border-0 pointer-events-none sm:pointer-events-auto"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="w-full pt-16">
          <div className="container mx-auto mt-16 px-4 sm:px-6">
            <h2 className="text-xl my-8 sm:text-2xl lg:text-3xl text-yellow uppercase">
              Як до нас зайти
            </h2>
          </div>
          <div className="w-full container mx-auto h-[calc(var(--vh,1svh)*80)] min-h-137.5 relative overflow-hidden bg-black">
            <video
              className="h-full w-full object-cover"
              src="/videos/hero.mp4"
              poster="/images/hero/hero-poster.webp"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      </div>
    </section>
  );
}