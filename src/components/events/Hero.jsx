import Image from "next/image";
import Button from "../ui/Button";
import { isCloudinaryUrl } from "@/lib/cloudinaryLoader";

export default function Hero({ featuredEvent, isUpcoming }) {
  return (
    <section className="relative h-svh w-full overflow-hidden text-white flex items-end pt-24 pb-10 sm:pb-14 lg:pb-16">
      <Image
        src="/images/events/events-hero.webp"
        alt="Події в Зачіпці"
        fill
        priority
        quality={80}
        sizes="(max-width: 768px) 250vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-noise-animated opacity-[0.06]" />
      </div>
      <div className="container relative z-10 mx-auto px-4 sm:px-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">
        <div className="max-w-xl flex flex-col gap-6">
          <h1 className="lowercase leading-none tracking-tight">
            події
          </h1>

          <p className=" leading-relaxed">
           Змагання, кінопокази, лекції, діджей-сети, виїзди на скелі та багато іншого.
Це нагода спробувати щось нове, зустріти знайомих або знайти своїх серед тих, хто поруч.
<br /><br /> Слідкуй за розкладом і бронюй місця заздалегідь.
          </p>
        </div>

        {featuredEvent && (
          <div className="w-full hidden md:block max-w-85 sm:max-w-95 lg:max-w-100 shrink-0 relative aspect-3/4 overflow-hidden shadow-2xl self-start lg:self-end">
            {isUpcoming ? (
              <Image
                src={featuredEvent.coverImage || "/images/events/events-up.webp"}
                unoptimized={isCloudinaryUrl(featuredEvent.coverImage)}
                alt={featuredEvent.title}
                fill
                quality={75}
                sizes="(max-width: 1024px) 150vw, 500px"
                className="object-cover"
              />
            ) 
            : (
              <Image
                src={featuredEvent.coverImage}
                unoptimized={isCloudinaryUrl(featuredEvent.coverImage)}
                alt={featuredEvent.title}
                fill
                quality={75}
                sizes="(max-width: 1024px) 150vw, 500px"
                className="object-cover"
              />
            )}
            
            <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent" />

            <div className="relative z-10 h-full flex flex-col justify-end p-6">
              <span className="text-red font-bold text-sm uppercase tracking-wider">
                  {isUpcoming ? "НАЙБЛИЖЧА ПОДІЯ" : "ОСТАННЯ ПОДІЯ"}
              </span>
              <h4 className="text-white text-4xl font-bold uppercase leading-tight mb-4">
                {featuredEvent.title}
              </h4>
              {isUpcoming ? (
                <Button
                  href={featuredEvent.crmUrl}
                  disabled={!featuredEvent.crmUrl || !featuredEvent.crmUrl.trim()}
                  bg="yellow"
                  color="gray"
                  center
                  uppercase
                >
                  {featuredEvent.crmUrl && featuredEvent.crmUrl.trim() ? "записатись" : "скоро"}
                </Button>
              ) : (
                <Button
                  href={`/events/${featuredEvent.slug}`}
                  bg="yellow"
                  color="gray"
                  center
                  uppercase
                >
                  докладніше
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
