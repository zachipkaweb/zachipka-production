"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { isCloudinaryUrl } from "@/lib/cloudinaryLoader";

// -----------------------------------------------------------------------------
// Responsive slide calculations & custom directional cursor assets
// -----------------------------------------------------------------------------
const getVisibleSlides = () => {
  if (typeof window === "undefined") return 3;

  if (window.innerWidth < 768) return 1;
  if (window.innerWidth <= 1024) return 2;

  return 3;
};

const arrowCursor = {
  left: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M11 8 L21 16 L11 24' fill='none' stroke='%23e0ec59' stroke-width='3' stroke-linecap='square' stroke-linejoin='miter' transform='rotate(180 16 16)'/%3E%3C/svg%3E") 16 16, pointer`,
  right: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M11 8 L21 16 L11 24' fill='none' stroke='%23e0ec59' stroke-width='3' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E") 16 16, pointer`,
};

/**
 * Team Carousel Component
 * Provides a responsive team slider with:
 * - Mobile native horizontal scroll-snap and touch swipe gestures
 * - Desktop directional click-to-slide with custom cursor arrows
 * - Dual-photo hover swap (primary portrait vs action shot)
 */
export default function Team({teamMembers=[]}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);
  const [hoverSide, setHoverSide] = useState(null);
  const scrollerRef = useRef(null);
  const slideRefs = useRef([]);

  const touchStartXRef = useRef(null);
  const touchDeltaXRef = useRef(0);

  useEffect(() => {
    const updateVisible = () => {
      const nextVisible = getVisibleSlides();

      setVisible((current) => {
        if (current === nextVisible) return current;
        setIndex((prevIndex) =>
          Math.min(
            prevIndex,
            Math.max(teamMembers.length - nextVisible, 0)
          )
        );
        return nextVisible;
      });
    };

    updateVisible();

    window.addEventListener("resize", updateVisible);

    return () => {
      window.removeEventListener("resize", updateVisible);
    };
  }, [teamMembers.length]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const onScroll = () => {
      if (window.innerWidth >= 768) return;

      const width = scroller.clientWidth;
      if (!width) return;

      const nextIndex = Math.round(scroller.scrollLeft / width);
      setIndex((current) =>
        current === nextIndex ? current : nextIndex
      );
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", onScroll);
    };
  }, []);

  const maxIndex = Math.max(teamMembers.length - visible, 0);
  const isMobile = visible === 1;

  const scrollMobileTo = (slideIndex) => {
    slideRefs.current[slideIndex]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
    setIndex(slideIndex);
  };

  const goPrev = () => {
    if (isMobile) {
      scrollMobileTo(Math.max(index - 1, 0));
      return;
    }

    setIndex((current) => Math.max(current - 1, 0));
  };

  const goNext = () => {
    if (isMobile) {
      scrollMobileTo(Math.min(index + 1, teamMembers.length - 1));
      return;
    }

    setIndex((current) => Math.min(current + 1, maxIndex));
  };

  // Desktop: Track cursor position over slider to toggle left/right navigation arrow
  const handleMouseMove = (event) => {
    if (isMobile) return;

    const { left, width } =
      event.currentTarget.getBoundingClientRect();

    setHoverSide(
      event.clientX - left > width / 2 ? "right" : "left"
    );
  };

  const handleSliderClick = () => {
    if (isMobile || !hoverSide) return;

    hoverSide === "right" ? goNext() : goPrev();
  };

  // Touch gesture listeners (swipe left / swipe right)
  const handleTouchStart = (event) => {
    touchStartXRef.current = event.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (event) => {
    if (touchStartXRef.current === null) return;
    touchDeltaXRef.current = event.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null) return;

    const threshold = 40;
    if (touchDeltaXRef.current < -threshold) {
      goNext();
    } else if (touchDeltaXRef.current > threshold) {
      goPrev();
    }

    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  const goToSlide = (slideIndex) => {
    if (isMobile) {
      scrollMobileTo(slideIndex);
      return;
    }

    setIndex(Math.min(slideIndex, maxIndex));
  };

  const activeDots = new Set(
    Array.from({ length: visible }, (_, i) => index + i)
  );

  return (
    <section id="team" className="relative z-10 w-full bg-gray -mb-1">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

      <div className="relative z-40 w-full">
        <div className="container mx-auto px-4 pt-6 sm:px-6">
          <div className="flex items-center justify-between">
            <h4 className="py-10 text-3xl font-bold uppercase leading-none text-yellow sm:py-16 sm:text-5xl lg:text-6xl">
              НАША КОМАНДА
            </h4>

            <div className="hidden items-center gap-2 min-[1025px]:flex">
              {teamMembers.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Перейти до слайду ${i + 1}`}
                  onClick={() => goToSlide(i)}
                  className={`h-1 cursor-pointer transition-all duration-300 ${
                    activeDots.has(i)
                      ? "w-8 bg-yellow"
                      : "w-4 bg-yellow/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="team-slider container relative w-full md:hidden">
          <div
            ref={scrollerRef}
            className="team-mobile-scroller flex h-full overflow-x-auto"
          >
            {teamMembers.map((member, i) => (
              <div
                key={i}
                ref={(el) => (slideRefs.current[i] = el)}
                className="team-card relative h-full w-full shrink-0 overflow-hidden"
              >
                <Image
                  src={member.firstImage}
                  unoptimized={isCloudinaryUrl(member.firstImage)}
                  alt={member.name}
                  fill
                  priority={i === 0}
                  quality={75}
                  draggable={false}
                  sizes="(max-width: 768px) 150vw, 50vw"
                  className="team-card__img select-none object-cover"
                />
                <div className="team-card__overlay pointer-events-none absolute inset-0" />
                <div className="team-card__name pointer-events-none absolute inset-x-0 bottom-0">
                  {member.position && (
                    <span className="team-card__position">{member.position}</span>
                  )}
                  <span>{member.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="team-slider relative hidden w-full max-w-500 mx-auto overflow-hidden md:block"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverSide(null)}
          onClick={handleSliderClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor:
              !isMobile && hoverSide
                ? arrowCursor[hoverSide]
                : "default",
          }}
        >
          <div
            className="flex h-full"
            style={{
              transform: `translate3d(-${
                index * (100 / visible)
              }%, 0, 0)`,
              transition:
                "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {teamMembers.map((member, i) => (
              <div
                key={i}
                className="team-card relative h-full shrink-0 overflow-hidden"
                style={{
                  width: `${100 / visible}%`,
                }}
              >
                <Image
                  src={member.firstImage}
                  unoptimized={isCloudinaryUrl(member.firstImage)}
                  alt={member.name}
                  fill
                  priority={i === 0}
                  quality={75}
                  draggable={false}
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="team-card__img select-none object-cover"
                />
                <Image
                  src={member.lastImage}
                  unoptimized={isCloudinaryUrl(member.lastImage)}
                  alt={member.name}
                  fill
                  quality={75}
                  draggable={false}
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="team-card__img_t select-none object-cover"
                />
                <div className="team-card__overlay pointer-events-none absolute inset-0" />
                <div className="team-card__name pointer-events-none absolute inset-x-0 bottom-0">
                  {member.position && (
                    <span className="team-card__position">{member.position}</span>
                  )}
                  <span>{member.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 py-8 sm:gap-6 sm:py-10 min-[1025px]:hidden">
          <button
            type="button"
            aria-label="Попередній слайд"
            onClick={goPrev}
            disabled={index === 0}
            className="flex h-10 w-10 cursor-pointer items-center justify-center text-yellow disabled:opacity-30 sm:h-12 sm:w-12"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M11 8 L21 16 L11 24"
                transform="rotate(180 16 16)"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {teamMembers.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Перейти до слайду ${i + 1}`}
                onClick={() => goToSlide(i)}
                className={`h-1 cursor-pointer transition-all duration-300 ${
                  activeDots.has(i)
                    ? "w-8 bg-yellow"
                    : "w-4 bg-yellow/30"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Наступний слайд"
            onClick={goNext}
            disabled={
              isMobile ? index === teamMembers.length - 1 : index === maxIndex
            }
            className="flex h-10 w-10 cursor-pointer items-center justify-center text-yellow disabled:opacity-30 sm:h-12 sm:w-12"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M11 8 L21 16 L11 24"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
