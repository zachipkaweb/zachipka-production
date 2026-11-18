import Image from "next/image";

export default function ForEveryone() {
  return (
    <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="container relative z-10 mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">

        <div className="order-1 lg:col-start-1 lg:row-start-1 flex flex-col gap-6 sm:gap-8">
          <h3 className="text-blue">Для всіх</h3>

          <h2 className="text-gray">
            НЕВАЖЛИВО,<br />
            ЯКИЙ ТИ<br />
            СЬОГОДНІ
          </h2>
        </div>

        <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 flex flex-col gap-6 lg:pt-12">
          <p>
            Наш скеледром відкритий для всіх — незалежно від досвіду, віку чи фізичної підготовки.
          </p>

          <div>
            <p className="mb-2">Якщо ти:</p>

            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                ніколи не лазив — ми навчимо з нуля і проведемо через перші маршрути
              </li>
              <li>
                вже маєш досвід — допоможемо покращити техніку і силу
              </li>
              <li>
                шукаєш альтернативу тренажерному залу — тут значно цікавіше
              </li>
              <li>
                хочеш спробувати щось нове разом з друзями або сім&apos;єю — це ідеальний варіант
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-2">У нас тренуються:</p>

            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>дорослі</li>
              <li>діти</li>
              <li>новачки і досвідчені спортсмени</li>
            </ul>
          </div>

          <p>
            Ти можеш займатись у своєму темпі або обрати заняття з тренером — усе залежить від твоїх цілей.
          </p>
        </div>

        <div className="order-3 lg:col-start-1 lg:row-start-2 relative w-full h-76 sm:h-96 md:h-105 lg:h-100">
          <Image
            src="/images/climbing/ForEveryone-one.webp"
            alt="Тренування для новачків"
            width={746}
            height={702}
            className="
              absolute
              z-20
              h-auto
              object-contain

              left-[-2%]
              top-[-2%]
              w-[82%]

              sm:left-[-2%]
              sm:top-[2%]
              sm:w-[70%]

              lg:left-0
              lg:top-1/2
              lg:-translate-y-1/2
              lg:w-[65%]
            "
          />

          <Image
            src="/images/climbing/ForEveryone-two.webp"
            alt="Тренування для досвідчених"
            width={608}
            height={515}
            className="
              absolute
              z-10
              h-auto
              object-contain

              right-[-2%]
              bottom-[-2%]
              w-[82%]

              sm:right-[-2%]
              sm:bottom-[2%]
              sm:w-[70%]

              lg:right-0
              lg:top-1/2
              lg:bottom-auto
              lg:-translate-y-1/2
              lg:w-[65%]
            "
          />
        </div>

      </div>
    </section>
  );
}