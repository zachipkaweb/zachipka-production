"use client";

import { useState } from "react";

const questions = [
  {
    number: "01",
    question: "ЧИ ПОТРІБНО МАТИ ДОСВІД, ЩОБ ПРИЙТИ?",
    answer:
      "Зовсім ні! У Зачіпку можна прийти без попереднього досвіду. Якщо це твоє перше заняття, почни зі вступного тренування чи інших пропозицій для новачків. Тренер ознайомить тебе із основами, розкаже про безпеку та допоможе зробити перші кроки.",
  },
  {
    number: "02",
    question: "З ЯКОГО ВІКУ МОЖНА ЗАЙМАТИСЬ?",
    answer:
      "Скелелазінням можна займатися і дітям, і дорослим. У нас є дитячі секції віком від 5 років, та тренування для дорослих. Верхньої вікової межі немає — усе залежить від твоїх можливостей і самопочуття.",
  },
  {
    number: "03",
    question: "ЧИ ПОТРІБНО ЗАПИСУВАТИСЬ ЗАЗДАЛЕГІДЬ?",
    answer:
      "Якщо плануєш самостійне відвідування, записуватися не потрібно. На тренування із тренером обовʼязкове попереднє бронювання.",
  },
  {
    number: "04",
    question: "ЩО ВХОДИТЬ У СПОРЯДЖЕННЯ?",
    answer:
      "Базовий набір для скелелазіння: скельники, страхувальна система та мішечок із магнезією. Усе необхідне спорядження можна орендувати у нас, тож купувати щось перед першим візитом не обов'язково.",
  },
  {
    number: "05",
    question: "ЧИ Є ПРОТИПОКАЗАННЯ ДО ЗАНЯТЬ СКЕЛЕЛАЗІННЯМ?",
    answer:
      "Скелелазіння – це фізична активність, яка потребує певної сили, координації та витривалості. Якщо маєш хронічні захворювання, травми або інші обмеження щодо фізичних навантажень, радимо перед заняттями проконсультуватися із лікарем. Якщо не впевнений(-а), чи підійде тобі скелелазіння, напиши нам – допоможемо розібратися.",
  },
];

export default function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (number) => {
    setOpenQuestion((current) =>
      current === number ? null : number
    );
  };

  return (
    <section id="faq" className="relative z-0 w-full overflow-hidden bg-gray py-16 -mt-1">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="relative z-10 w-full">


        <div className="container mx-auto px-4 sm:px-6">
          <h4 className="text-3xl font-bold uppercase leading-none text-yellow sm:text-5xl lg:text-6xl">
            ПОШИРЕНІ ЗАПИТАННЯ
          </h4>
        </div>

        <div className="mt-8 w-full sm:mt-12">
          {questions.map((item) => {
            const isOpen = openQuestion === item.number;

            return (
              <div
                key={item.number}
                className="group px-4 sm:px-6 relative w-full"
              >
                <div className="absolute inset-0 -z-10 bg-transparent transition-colors duration-300 group-hover:bg-red" />

                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleQuestion(item.number)}
                  className="
                    relative
                    flex
                    min-h-12
                    w-full
                    cursor-pointer
                    items-center
                    text-left
                    sm:min-h-14
                  "
                >
                  <div className="container mx-auto flex w-full items-center px-4 sm:px-6">
                    <span className="w-12 shrink-0 text-sm font-medium text-yellow sm:w-20 sm:text-base">
                      {item.number}
                    </span>

                    <span className="text-sm font-semibold uppercase text-yellow sm:text-base lg:text-lg">
                      {item.question}
                    </span>
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="container mx-auto px-4 sm:px-6">
                      <div className="pb-5 pl-14 pr-8 pt-2 text-sm leading-relaxed text-yellow/80 sm:pl-20 sm:pr-16 sm:text-base lg:max-w-3xl">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}