import Button from "../ui/Button";
import { formatEventDate } from "@/lib/dates";

export default function UpcomingEvents({upEvents=[], isUpcoming}) {
  return (
    <section className="relative pt-32 w-full overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 mb-10 sm:mb-16">
          <h3 className="text-purple uppercase mb-8 font-bold text-sm tracking-wider">
            НЕ СТІЙ НА МІСЦІ
          </h3>
          <h2 className="text-gray uppercase leading-none">
            НАЙБЛИЖЧІ ПОДІЇ
          </h2>
          <p className="text-gray text-sm sm:text-base">
            Місця обмежені — реєструйся заздалегідь
          </p>
        </div>

        {isUpcoming ? (
          <div className="flex flex-col">
          {upEvents.filter((e) => e.isActive).map((event, i) => (
            <div
              key={event.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 py-5 sm:py-6 px-2 sm:px-4 border-b border-gray/20 transition-colors duration-200 hover:bg-black/5"
            >
              <span className="w-36 sm:w-44 text-gray/80 font-bold text-lg shrink-0">
                {formatEventDate(event.eventDate, event.endDate, { mode: 'short' })}
              </span>

              <h4 className="flex-1 text-gray uppercase font-semibold text-xl">
                {event.title}
              </h4>

              <span className="flex-1 text-gray text-md">
                {event.shortDescription}
              </span>
              {event.crmUrl && event.crmUrl.trim() ? (
                <Button href={event.crmUrl} bg="yellow" color="gray" uppercase>
                  Записатись
                </Button>
              ) : (
                <Button bg="yellow" disabled color="gray" uppercase>
                  Скоро
                </Button>
              )}
            </div>
          ))}
        </div>
        ) : (
          <div className="w-full h-80 border-2 border-dashed flex justify-center items-center border-gray-300">
            <p className="text-gray-300">На жаль, ближчим часом подій не заплановано</p>
          </div>
        )}
      </div>
    </section>
  );
}
