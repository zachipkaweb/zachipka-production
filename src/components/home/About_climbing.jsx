import Image from "next/image";
import ButtonLink from "../ui/ButtonLink";
import { BLUR_DATA_URLS } from "@/lib/blurPlaceholders";

export default function About_climbing() {
  return (
    <section className="relative min-h-[calc(var(--vh,1svh)*20)] xl:min-h-[calc(var(--vh,1svh)*80)]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />
      <div className="container relative z-10 mx-auto px-6">
        <div className="relative flex flex-col justify-center gap-4 overflow-hidden py-16 lg:w-1/2 lg:py-20 bg-white xl:bg-transparent">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04] xl:opacity-0" />

          <div className="relative z-10 flex flex-col gap-6 py-8">
            <h3 className="text-red">про скелелазіння</h3>
            <h2 className="uppercase text-gray text-[clamp(40px,6vw,120px)]">
              рух, що <br />
              змінює
            </h2>
            <p className="max-w-md text-gray">
              Скелелазіння — це поєднання руху, концентрації та постійного пошуку нових рішень.
            </p>
            <ButtonLink href="/climbing#AboutClimbing">докладніше</ButtonLink>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 md:top-0 h-full lg:w-[55%]">
        <Image
          src="/images/hero/climbing.webp"
          alt="Про скелелазіння"
          fill
          quality={95}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URLS.homeClimbing}
          sizes="(max-width: 1023px) 200vw, 61vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
