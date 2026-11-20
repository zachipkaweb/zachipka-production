import Link from "next/link";
import Image from "next/image";
import ButtonLink from "../ui/ButtonLink";

const cards = [
  {
    title: "події",
    image: "/images/hero/events.webp",
    href: "/events",
  },
  {
    title: "виїзди",
    image: "/images/hero/trips.webp",
    href: "/events",
  },
  {
    title: "кіно та музика",
    image: "/images/hero/films-music.webp",
    href: "/events",
  },
];

export default function Community() {
  return (
    <section id="community" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="mt-20 text-purple sm:mt-24 lg:mt-32">спільнота</h3>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="h-24 w-16 shrink-0 bg-purple sm:h-30 sm:w-20 lg:h-37.5 lg:w-25"
              style={{
                maskImage: "url('/logo.svg')",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "contain",
                WebkitMaskImage: "url('/logo.svg')",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: "contain",
              }}
            />

            <div>
              <h4 className="text-4xl font-bold leading-none text-gray sm:text-5xl lg:text-6xl">
                ЗАЧІПКА
              </h4>

              <h4 className="text-4xl font-bold uppercase leading-none text-gray sm:text-5xl lg:text-6xl">
                community
              </h4>
            </div>
          </div>

          <p className="text-gray lg:max-w-xs">
            Спільні виїзди, кіно, музика та інші події від Зачіпка
          </p>

          <ButtonLink href="/events">усі події</ButtonLink>
        </div>

        <div className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative min-h-75 overflow-hidden sm:min-h-87.5 lg:min-h-[40svh]"
            >
              <Image
                src={card.image}
                alt={card.title}
                fill
                quality={75}
                sizes="(max-width: 640px) 150vw, (max-width: 1024px) 75vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

              <div className="relative z-10 flex h-full items-end p-4 sm:p-5">
                <h4 className="text-3xl font-bold uppercase text-white sm:text-4xl">
                  {card.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
