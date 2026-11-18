"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "ГОЛОВНА" },
  { href: "/climbing", label: "СКЕЛЕДРОМ" },
  { href: "/training", label: "ТРЕНУВАННЯ" },
  { href: "/events", label: "ПОДІЇ" },
  { href: "/find-us", label: "ЯК НАС ЗНАЙТИ" },
  { href: "/contacts", label: "КОНТАКТИ" },
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer
      id="contacts"
      className="relative w-full overflow-hidden bg-yellow text-gray pt-10 pb-6 sm:pt-12 "
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-start">

          <div className="sm:col-span-2 lg:col-span-5 flex flex-col items-start">
            <Link href="/" className="w-32 sm:w-45 lg:w-70 h-auto block hover:opacity-90 transition-opacity">
              <Image
                src="/big_logo.webp"
                alt="Зачіпка логотип"
                width={400}
                height={100}
                className="w-full h-auto object-contain"
              />
            </Link>
          </div>

          <nav
            aria-label="Навігація у футері"
            className=" lg:col-span-3 grid grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-2.5 sm:gap-y-3 uppercase"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm sm:text-base font-medium tracking-wide transition-colors hover:text-red ${
                    isActive ? "font-bold text-red" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Working hours and contacts */}
          <div className="lg:col-span-4 flex flex-col gap-3 text-sm sm:text-base font-light lg:items-end lg:text-right">
            <div className="space-y-1 font-normal">
              <div>пн-пт | 12:00–22:00</div>
              <div>сб-нд | 10:00–20:00</div>
            </div>

            <div className="max-w-64 leading-snug pt-0.5">
              м. Івано-Франківськ, вул. Української Перемоги, 23Д
            </div>

            <div className="flex flex-col gap-1.5 pt-0.5">
              <a
                href="tel:+380688123319"
                className="font-normal hover:text-red transition-colors"
              >
                +38 068 812 33 19
              </a>

              <a
                href="mailto:info@zachipka.ua"
                className="hover:text-red transition-colors"
              >
                info@zachipka.ua
              </a>
            </div>

            <div className="flex items-center gap-4 pt-1 lg:justify-end">
              <a
                href="https://instagram.com/zachipka_skeledrom"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 hover:text-red transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://t.me/zachipka"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 hover:text-red transition-colors"
              >
                Telegram
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-8 sm:mt-10 pt-5 border-t border-gray/15">
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 text-xs font-semibold tracking-wider text-gray/70">
          <span>© 2026 ZACHIPKA. ALL RIGHTS RESERVED.</span>
          <span>
            DEVELOPED BY{" "}
            <a
              href="https://www.instagram.com/__myliani/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray underline underline-offset-2 hover:text-red transition-colors"
            >
              O.М.
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
