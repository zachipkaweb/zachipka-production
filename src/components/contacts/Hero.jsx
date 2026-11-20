"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { FaPhoneAlt, FaEnvelope, FaInstagram, FaTelegramPlane } from 'react-icons/fa';

/**
 * Contacts Hero & Feedback Form Component
 * Includes:
 * - Direct submission to Telegram API bot endpoint
 * - Multi-layer spam defenses: hidden honeypot field ("company") and submission time-trap ("formLoadedAt")
 * - Live phone input sanitization and character length counter for message
 * - Torn paper decorative SVG banner divider
 */
export default  function Hero() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    company: '',
  });

  // Track component mount timestamp for server-side time-trap bot detection (> 2s required)
  const [formLoadedAt] = useState(() => Date.now());

  // Phone input sanitization: allow only digits and standard telephone delimiters
  const handlePhoneChange = (e) => {
    const filtered = e.target.value.replace(/[^0-9+\s\-()]/g, '');
    if (filtered.length <= 18) {
      setFormData({ ...formData, phone: filtered });
    }
  };

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, formLoadedAt }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', email: '', message: '', company: '' });
      } else {
        setStatus('error');
        setErrorMessage(data?.error || 'Сталася помилка. Спробуйте ще раз.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setStatus('error');
      setErrorMessage('Не вдалося звʼязатися з сервером. Спробуйте ще раз.');
    }
  };

  return (
    <section className="relative min-h-svh w-full flex items-center justify-center pt-28 sm:pt-36 pb-52 sm:pb-60 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <Image
        src="/images/contacts/hero.webp"
        alt="Скеледром Зачіпка контакти"
        fill
        priority
        quality={80}
        sizes="(max-width: 768px) 200vw, 100vw"
        className="object-cover object-center pointer-events-none"
      />
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl lg:max-w-6xl  2xl:max-w-310">
        <div className="relative bg-yellow text-gray shadow-2xl">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 pb-6 sm:pb-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="flex flex-col">
              <h1 className="text-gray font-bold uppercase tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-none">
                КОНТАКТИ
              </h1>
              <p className="text-gray text-sm sm:text-base leading-relaxed mt-4 sm:mt-6 max-w-md font-normal">
                Маєте питання або хочете записатись?
                <br />
                Напишіть нам — підкажемо, допоможемо і підберемо варіант саме для вас.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="contact-form flex flex-col gap-3.5 sm:gap-4 w-full max-w-md sm:max-w-none md:max-w-none xl:max-w-md xl:ml-auto"
            >
              {/* Anti-spam honeypot input: hidden from human users, traps automated bots */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.company ?? ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="ІМ'Я"
                value={formData.name ?? ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full bg-transparent border border-gray/60 px-4 py-3 text-xs sm:text-sm uppercase text-gray placeholder:text-gray/70 focus:outline-none focus:border-gray tracking-wider transition-colors"
              />
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="ТЕЛЕФОН"
                value={formData.phone ?? ''}
                onChange={handlePhoneChange}
                required
                className="w-full bg-transparent border border-gray/60 px-4 py-3 text-xs sm:text-sm uppercase text-gray placeholder:text-gray/70 focus:outline-none focus:border-gray tracking-wider transition-colors"
              />
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="EMAIL (НЕОБОВ'ЯЗКОВО)"
                value={formData.email ?? ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-transparent border border-gray/60 px-4 py-3 text-xs sm:text-sm uppercase text-gray placeholder:text-gray/70 focus:outline-none focus:border-gray tracking-wider transition-colors"
              />
              <div className="relative w-full">
              <textarea
                name="message"
                rows={4}
                placeholder="ПОВІДОМЛЕННЯ"
                maxLength={500}
                value={formData.message ?? ''}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="w-full bg-transparent border border-gray/60 px-4 py-3 text-xs sm:text-sm uppercase text-gray placeholder:text-gray/70 focus:outline-none focus:border-gray tracking-wider transition-colors resize-none"
              />
              <div className="text-right text-[10px] text-gray/60 tracking-wider -mt-7 pe-2">
                {formData.message.length} / 500
              </div>
            </div>

              <div className="pt-1 flex items-center justify-between">
                <Button type="submit" bg="gray" color="yellow" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Відправка...' : 'Надіслати'}
                </Button>
              </div>
              {status === 'success' && (
                <p className="text-green-600 text-xs sm:text-sm font-medium">Повідомлення успішно надіслано!</p>
              )}
              {status === 'error' && (
                <p className="text-red-600 text-xs sm:text-sm font-medium">
                  {errorMessage || 'Сталася помилка. Спробуйте ще раз.'}
                </p>
              )}
            </form>
          </div>

          <div className="relative w-full mb-32 h-8 sm:h-10">
            <svg
              className="absolute top-0 mt-8 left-0 w-full h-full text-yellow pointer-events-none"
              viewBox="0 0 1200 48"
              preserveAspectRatio="none"
              fill="currentColor"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="torn-noise"
                  patternUnits="userSpaceOnUse"
                  width="200"
                  height="200"
                >
                  <image href="/noise.png" width="200" height="200" />
                </pattern>
                <path
                  id="torn-edge"
                  d="M 0 0 L 1200 0 L 1200 23.3 L 1200 23.3 L 1192.5 17.7 L 1185 17.7 L 1177.5 22.4 L 1170 22.5 L 1162.5 19 L 1155 22.3 L 1147.5 18.7 L 1140 19.3 L 1132.5 19.7 L 1125 21.3 L 1117.5 18.9 L 1110 17 L 1102.5 17.3 L 1095 22 L 1087.5 23.1 L 1080 21.6 L 1072.5 25.4 L 1065 24.9 L 1057.5 18.3 L 1050 19 L 1042.5 25.3 L 1035 21.6 L 1027.5 22.8 L 1020 20.8 L 1012.5 25.5 L 1005 22.9 L 997.5 20.2 L 990 23.8 L 982.5 23.8 L 975 20 L 967.5 21.6 L 960 24.1 L 952.5 20.3 L 945 24.2 L 937.5 19.3 L 930 23 L 922.5 21.8 L 915 26.2 L 907.5 23.3 L 900 22.1 L 892.5 18.7 L 885 22.7 L 877.5 23.9 L 870 19.1 L 862.5 21 L 855 21.7 L 847.5 21.6 L 840 21.9 L 832.5 22.1 L 825 25.4 L 817.5 26.7 L 810 26.5 L 802.5 27.3 L 795 29.6 L 787.5 31 L 780 26.4 L 772.5 32.3 L 765 30.3 L 757.5 28.7 L 750 31.9 L 742.5 27.2 L 735 29 L 727.5 35.1 L 720 30.7 L 712.5 32.6 L 705 32.6 L 697.5 31.4 L 690 32 L 682.5 30.4 L 675 29.5 L 667.5 28.7 L 660 26.8 L 652.5 29.3 L 645 33.3 L 637.5 29.1 L 630 28.4 L 622.5 24.9 L 615 24.6 L 607.5 21.7 L 600 27.9 L 592.5 22.2 L 585 23.8 L 577.5 22.1 L 570 19 L 562.5 19.5 L 555 22 L 547.5 16.7 L 540 16.4 L 532.5 16.3 L 525 15.1 L 517.5 18.5 L 510 15.4 L 502.5 15.4 L 495 15.4 L 487.5 19.3 L 480 19.2 L 472.5 19.9 L 465 20.7 L 457.5 17.4 L 450 14.6 L 442.5 20.7 L 435 21.3 L 427.5 18.5 L 420 16.3 L 412.5 21.1 L 405 16.8 L 397.5 18.1 L 390 21.3 L 382.5 21.3 L 375 23.4 L 367.5 23.8 L 360 21.5 L 352.5 22.1 L 345 23.3 L 337.5 20.8 L 330 26.4 L 322.5 22.5 L 315 26.5 L 307.5 27.5 L 300 26.7 L 292.5 22.6 L 285 26.2 L 277.5 25.4 L 270 24.9 L 262.5 27.5 L 255 26.8 L 247.5 25 L 240 26.4 L 232.5 26.6 L 225 25.3 L 217.5 24.8 L 210 26.2 L 202.5 24.9 L 195 30.3 L 187.5 25.8 L 180 24.9 L 172.5 23.9 L 165 25.3 L 157.5 27.6 L 150 27.1 L 142.5 23.8 L 135 24.8 L 127.5 25.9 L 120 24.9 L 112.5 28.7 L 105 27.4 L 97.5 27.3 L 90 27.1 L 82.5 27.4 L 75 28.1 L 67.5 25.1 L 60 29 L 52.5 32.1 L 45 30.7 L 37.5 27.8 L 30 28.9 L 22.5 28 L 15 29.5 L 7.5 26 L 0 23.8 Z"
                />
              </defs>

              <use href="#torn-edge" fill="currentColor" />
              <use href="#torn-edge" fill="url(#torn-noise)" opacity="0.04" />
            </svg>

            <a
              href="tel:+380688123319"
              aria-label="Телефон: +38 068 812 33 19"
              className="group absolute mt-8 top-0 left-[4%] sm:left-[6%] lg:left-[7%] w-10 sm:w-12 lg:w-14 h-52 sm:h-60 lg:h-68 bg-yellow transition-all duration-200 hover:-translate-y-1 hover:brightness-110 flex flex-col items-center justify-start pt-3.5 sm:pt-4.5 pb-2 overflow-hidden z-20 cursor-pointer"
            >
              <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />
              <FaPhoneAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray group-hover:text-red transition-colors shrink-0 mb-2 sm:mb-3" />
              <span
                className="text-gray text-xs sm:text-sm lg:text-base font-normal tracking-wide select-all transition-colors group-hover:text-red"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "sideways",
                  WebkitWritingMode: "vertical-rl",
                  WebkitTextOrientation: "sideways",
                }}
              >
                +38 068 812 33 19
              </span>
            </a>

            <a
              href="mailto:zachipka.skeledrom@gmail.com"
              aria-label="Email: zachipka.skeledrom@gmail.com"
              className="group absolute mt-8 top-0 left-[18%] sm:left-[19%] lg:left-[19%] w-10 sm:w-12 lg:w-14 h-52 sm:h-60 lg:h-68 bg-yellow transition-all duration-200 hover:-translate-y-1 hover:brightness-110 flex flex-col items-center justify-start pt-3.5 sm:pt-4.5 pb-2 overflow-hidden z-20 cursor-pointer"
            >
              <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />
              <FaEnvelope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray group-hover:text-red transition-colors shrink-0 mb-1.5 sm:mb-2" />
              <span
                className="text-gray text-[10px] sm:text-xs lg:text-[13.5px] font-normal tracking-tight select-all transition-colors group-hover:text-red whitespace-nowrap"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "sideways",
                  WebkitWritingMode: "vertical-rl",
                  WebkitTextOrientation: "sideways",
                }}
              >
                zachipka.skeledrom@gmail.com
              </span>
            </a>

            <a
              href="https://instagram.com/zachipka_skeledrom"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram: @zachipka_skeledrom"
              className="group absolute mt-8 top-0 left-[52%] sm:left-[56%] lg:left-[58%] w-10 sm:w-12 lg:w-14 h-52 sm:h-60 lg:h-68 bg-yellow transition-all duration-200 hover:-translate-y-1 hover:brightness-110 flex flex-col items-center justify-start pt-3.5 sm:pt-4.5 pb-2 overflow-hidden z-20 cursor-pointer"
            >
              <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />
              <FaInstagram className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray group-hover:text-red transition-colors shrink-0 mb-2 sm:mb-3" />
              <span
                className="text-gray text-xs sm:text-sm lg:text-base font-normal tracking-wide select-all transition-colors group-hover:text-red"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "sideways",
                  WebkitWritingMode: "vertical-rl",
                  WebkitTextOrientation: "sideways",
                }}
              >
                @zachipka_skeledrom
              </span>
            </a>

            <a
              href="https://t.me/zachipka"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram: t.me/zachipka"
              className="group absolute mt-8 top-0 left-[78%] sm:left-[82%] lg:left-[84%] w-10 sm:w-12 lg:w-14 h-52 sm:h-60 lg:h-68 bg-yellow transition-all duration-200 hover:-translate-y-1 hover:brightness-110 flex flex-col items-center justify-start pt-3.5 sm:pt-4.5 pb-2 overflow-hidden z-20 cursor-pointer"
            >
              <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />
              <FaTelegramPlane className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray group-hover:text-red transition-colors shrink-0 mb-2 sm:mb-3" />
              <span
                className="text-gray text-xs sm:text-sm lg:text-base font-normal tracking-wide select-all transition-colors group-hover:text-red"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "sideways",
                  WebkitWritingMode: "vertical-rl",
                  WebkitTextOrientation: "sideways",
                }}
              >
                t.me/zachipka
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}