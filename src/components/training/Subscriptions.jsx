
import Link from "next/link";

export default function Subscriptions({subscriptionsData=[]}) {
  return (
    <section className="relative pt-16 sm:pt-24 lg:pt-32 w-full bg-gray text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-16">
          <div>
            <h3 className="text-yellow mb-4 sm:mb-8 uppercase font-bold text-sm tracking-wider">
              Тренуйся у своєму ритмі
            </h3>
            <h2 className="text-yellow text-3xl sm:text-5xl lg:text-7xl font-bold uppercase leading-none">
              САМОСТІЙНЕ<br className="sm:hidden" /> ВІДВІДУВАННЯ
            </h2>
          </div>
          <div className="max-w-md text-white text-sm sm:text-base lg:pb-2">
            <p>
              Обирай зручний формат відвідувань і тренуйся у своєму темпі.
            </p>
          </div>
        </div>
      </div>

      <div className="flex mt-12 sm:mt-20 lg:mt-32 flex-col border-t-2 border-yellow">
        {subscriptionsData.map((item) => (
          <div
            key={item.id}
            className="group py-4 sm:py-5 lg:py-6 px-4 sm:px-6 border-b-2 border-yellow transition-colors duration-200 hover:bg-yellow"
          >
            <div className="flex max-w-2xl items-center justify-between mx-auto gap-4">
              <span className="text-yellow group-hover:text-gray font-semibold text-xl uppercase tracking-wider transition-colors duration-200">
                {item.title}
              </span>
              <span className="text-yellow group-hover:text-gray font-semibold text-xl  uppercase tracking-wider transition-colors duration-200 shrink-0">
                {item.price} {item.period}
              </span>
            </div>
          </div>
        ))}

        <Link
          href="https://zachipka.gymsatellite.com/clients/auth"
          className="w-full h-16 text-xl font-semibold text-gray bg-yellow cursor-pointer flex items-center justify-center"
        >
          ПРИДБАТИ
        </Link>
      </div>
    </section>
  );
}
