import Image from "next/image";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";

export const metadata = {
  title: "404 — Маршрут не знайдено | Зачіпка",
};

export default function NotFound() {
  return (
    <main className="relative min-h-svh w-full bg-gray text-white overflow-hidden flex items-center justify-center pt-24 pb-16 px-4 sm:px-6">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="pointer-events-none select-none absolute z-0">
        <div className="flex flex-col items-center gap-6 sm:gap-8">
          <div className="inline-flex items-center gap-3  px-3.5 py-1.5">
            <span className="text-xs sm:text-sm font-bold text-center uppercase tracking-widest text-red">
              Помилка
            </span>
          </div>

          <div className="relative p-4">
            <span className="block font-extrabold uppercase leading-[0.85] text-center tracking-tighter text-yellow text-[clamp(6rem,20vw,15rem)] select-none">
              404
            </span>
          </div>

          <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed">
            Такої сторінки не існує або її було переміщено.
          </p>

          <div className="mt-2 flex flex-col md:flex-row items-center gap-4 sm:gap-6">
            <Button href="/" bg="yellow" color="gray" uppercase>
              На головну
            </Button>
            <Button href="/training" bg="white" color="gray" uppercase>
              Обрати тренування
            </Button>
            <div className="sm:ms-2">
              <ButtonLink href="/events" color="yellow" arrow="red">
                усі події
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
