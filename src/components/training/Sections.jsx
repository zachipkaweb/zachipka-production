import Image from "next/image";
import Button from "../ui/Button";
import { isCloudinaryUrl, optimizeCloudinaryUrl } from "@/lib/cloudinaryLoader";

const PALETTE_HEX = {
  orange: "#ff991b",
  purple: "#9e5aa5",
  red: "#e0564a",
  blue: "#3eb7df",
  yellow: "#e0ec59",
  gray: "#3f3d3d",
};

function resolveSectionColor(c, defaultColor) {
  if (!c) return defaultColor;
  const lower = c.trim().toLowerCase();
  return PALETTE_HEX[lower] || c;
}

function isLightColor(colorHex) {
  if (!colorHex) return false;
  const hex = colorHex.replace("#", "");
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180;
  }
  return false;
}

export default function Sections({ sectionsData = [] }) {
  return (
    <section className="relative pt-16 md:pt-24 pb-20 md:pb-32 w-full overflow-hidden">
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-x-0 bottom-0 h-44 sm:h-56 lg:h-64 bg-gray z-0" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-16">
          <div>
            <h3 className="text-orange mb-4 sm:mb-8 uppercase font-bold text-sm tracking-wider">
              Секції
            </h3>
            <h2 className="text-gray text-3xl sm:text-5xl lg:text-6xl font-bold uppercase leading-tight">
              СИСТЕМАТИЧНІ<br />ТРЕНУВАННЯ
            </h2>
          </div>
          <div className="max-w-md text-gray text-sm sm:text-base lg:text-lg lg:pb-3">
            <p>
              Регулярні заняття допомагають розвивати силу, витривалість і техніку. Обери свій напрямок.
            </p>
          </div>
        </div>

        <div className="flex flex-col w-full">
          {sectionsData.filter((sec) => sec.image).map((sec, idx) => {
            const defaultFallbackColor = idx % 2 === 0 ? "#ff991b" : "#9e5aa5";
            const color = resolveSectionColor(sec.color, defaultFallbackColor);
            const isLight = isLightColor(color);
            const textColor = isLight ? "text-gray" : "text-white";
            const imageSrc = sec.image;

            return (
              <div
                key={sec.id}
                className="relative flex flex-col md:flex-row w-full overflow-hidden mb-6 sm:mb-8"
              >
                <div
                  className="w-full md:w-[62%] h-70 sm:h-80 md:h-78.75 p-6 sm:p-10 lg:p-12 flex flex-col justify-between z-10"
                  style={{ backgroundColor: color }}
                >
                  <div>
                    <h4
                      className={`${textColor} text-4xl lg:text-5xl font-bold uppercase leading-tight`}
                    >
                      {sec.title}
                    </h4>

                    {sec.description && (
                      <p
                        className={`${textColor} mt-2 sm:mt-3 text-sm sm:text-base max-w-md`}
                      >
                        {sec.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 sm:gap-6 mt-6 sm:mt-8">
                    <Button
                      href={sec.crmUrl?.trim() || "https://zachipka.gymsatellite.com/client_book_class/locations"}
                      bg="white"
                      color="gray"
                      uppercase
                    >
                      Записатись
                    </Button>

                    <span
                      className={`${textColor} text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-tight`}
                    >
                      {sec.price} {sec.period}
                    </span>
                  </div>
                </div>

                <div className="relative md:-ms-1 -mt-1 md:mt-0 w-full h-15 md:w-auto md:h-78.75 shrink-0 z-30 overflow-hidden">
                  <svg
                    viewBox="0 0 61 315"
                    className="
                      absolute
                      w-15 h-[100vw]
                      left-1/2 top-1/2
                      -translate-x-1/2 -translate-y-1/2
                      rotate-90

                      md:static
                      md:w-auto md:h-full
                      md:translate-x-0 md:translate-y-0
                      md:rotate-0
                    "
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M61 315H56C56 301.193 44.8071 290 31 290C17.1929 290 6 301.193 6 315H0V0H6C6 13.8071 17.1929 25 31 25C44.8071 25 56 13.8071 56 0H61V315ZM29.0098 267.125L29.0107 277H33.0107L33.0098 267.125H29.0098ZM29.0088 237.5L29.0098 257.25H33.0098L33.0088 237.5H29.0088ZM29.0078 207.875L29.0088 227.625H33.0088L33.0078 207.875H29.0078ZM29.0059 178.25L29.0068 198H33.0068L33.0059 178.25H29.0059ZM29.0049 148.625L29.0059 168.375H33.0059L33.0049 148.625H29.0049ZM29.0039 119V138.75H33.0039V119H29.0039ZM29.002 89.375L29.0029 109.125H33.0029L33.002 89.375H29.002ZM29.001 59.75L29.002 79.5H33.002L33.001 59.75H29.001ZM29 40V49.875H33V40H29Z"
                      fill={color}
                    />
                  </svg>
                </div>

                <div className="w-full md:-ms-1 md:w-[30%] lg:w-[38%] relative h-60 sm:h-70 md:h-78.75">
                  <Image
                    src={optimizeCloudinaryUrl(imageSrc, 1200)}
                    unoptimized={isCloudinaryUrl(imageSrc)}
                    alt={sec.title}
                    fill
                    quality={90}
                    sizes="(max-width: 768px) 150vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
