import Image from "next/image";
import Button from "../ui/Button";

export default function First_class() {
  return (
    <section
      id="first-class"
      className="relative overflow-hidden py-10 sm:py-12 lg:py-16"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <h4 className="text-red uppercase font-extrabold leading-[0.9] text-[clamp(3rem,8vw,9rem)]">
            готовий почати?
          </h4>

          <div className="flex justify-start sm:justify-end">
            <h4 className="text-red uppercase font-extrabold leading-[0.9] text-[clamp(3rem,8vw,9rem)]">
              перше заняття
            </h4>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-10 sm:mt-14 lg:mt-16 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full lg:max-w-xl">
            <p className="max-w-lg text-sm leading-relaxed text-gray sm:text-base lg:text-lg">
              Ніколи не пробував скелелазіння? Це не проблема — перше заняття
              ідеально підходить для новачків. Ми познайомимо вас з основами,
              навчимо техніці безпеки та допоможемо зробити перші впевнені кроки
              на стіні у комфортному темпі.
            </p>

            <div className="mt-8 flex gap-3 sm:mt-12 flex-row sm:gap-4">
              <Button href="https://zachipka.gymsatellite.com/client_book_time/locations">
                Записатись на тренування
              </Button>
            </div>
          </div>

          <div
            className="relative aspect-3384/2210 w-85 sm:w-115 md:w-145 lg:w-195 xl:w-225 shrink-0 self-center mx-auto lg:self-auto lg:mx-0 lg:-ms-85 xl:-ms-95"
          >
            <Image
              src="/images/hero/hook.webp"
              alt="Зачіпки"
              fill
              sizes="(min-width: 1280px) 900px, (min-width: 1024px) 780px, (min-width: 768px) 580px, (min-width: 640px) 460px, 340px"
              className="object-contain ms-0 md:ms-24"
            />
          </div>

          <Image
            src="/images/hero/first.svg"
            alt="Декоративний елемент"
            width={100}
            height={100}
            className="hidden w-16 h-auto shrink-0 lg:block xl:w-24"
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between md:items-end mt-16">
          <h4 className="text-4xl font-bold mb-2 uppercase leading-none text-gray sm:text-5xl lg:text-6xl">
            галерея
          </h4>
          <p className="text-gray max-w-xl">
            Наш скеледром — це не лише маршрути, а цілий простір для руху й
            відпочинку. Зазирни всередину
          </p>
        </div>
      </div>
    </section>
  );
}
