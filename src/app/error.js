"use client";

import Button from "@/components/ui/Button";

export default function ErrorPage({ reset }) {
  return (
    <main className="relative min-h-svh w-full bg-gray text-white overflow-hidden flex items-center justify-center pt-24 pb-16 px-4 sm:px-6">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="container relative z-10 mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-6 sm:gap-8 pl-6 sm:pl-10 py-2">
          <span className="text-center text-red text-xs sm:text-sm font-bold uppercase tracking-widest px-3 py-1">
            Технічна помилка
          </span>

          <h1 className="text-4xl text-center sm:text-6xl lg:text-7xl font-bold uppercase leading-none text-yellow">
            Упс! Щось пішло не так
          </h1>

          <p className="text-white/80 text-center text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed">
            Виникла непередбачена помилка під час завантаження сторінки.
            Спробуй зробити ще одну спробу або повернись на старт.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Button
              onClick={() => reset?.()}
              bg="yellow"
              color="gray"
              uppercase
            >
              Спробувати ще раз
            </Button>
            <Button href="/" bg="white" color="gray" uppercase>
              На головну
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
