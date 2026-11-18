"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { formatEventDate } from "@/lib/dates";
import cloudinaryLoader from "@/lib/cloudinaryLoader";
import { FaStar } from 'react-icons/fa';

gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

const DESKTOP_MQ = "(min-width: 768px)";

export default function PastEvents({ pastEvents = [] }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const isStantsiya = (slug) => slug === 'stantsiya' || slug?.startsWith('stantsiya-');

  const sortedEvents = [...pastEvents].sort((a, b) => {
    if (isStantsiya(a.slug)) return -1;
    if (isStantsiya(b.slug)) return 1;
    return 0;
  });

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(DESKTOP_MQ, () => {
        const getScrollAmount = () => track.scrollWidth - window.innerWidth;

        gsap.to(track, {
          x: () => -getScrollAmount(),
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getScrollAmount()}`,
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        });

        return () => {
          gsap.set(track, { clearProps: "transform" });
        };
      });
    },
    { scope: sectionRef }
  );

  return (
    <>
      <section className="relative w-full bg-white">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 pt-16 sm:pt-20 lg:pt-28 pb-8 sm:pb-12">
          <div className="flex flex-col gap-2">
            <h3 className="text-orange mb-4 sm:mb-8 uppercase font-bold text-sm tracking-wider">
              А ЩО ВЖЕ БУЛО
            </h3>
            <h2 className="text-gray text-4xl sm:text-6xl lg:text-7xl font-bold uppercase leading-none">
              МИНУЛІ ПОДІЇ
            </h2>
          </div>
        </div>
      </section>

      <section
        id="past-events"
        ref={sectionRef}
        className="gallery-section relative w-full overflow-x-auto bg-black md:h-[calc(var(--vh,1svh)*100+2px)] md:-mb-0.5 md:overflow-hidden"
      >
        <div
          ref={trackRef}
          className="flex h-[calc(var(--vh,1svh)*70)] w-max md:h-full md:w-fit md:will-change-transform bg-black"
        >
          {sortedEvents.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="block w-[85vw] min-[481px]:w-[75vw] md:w-[60vw] lg:w-[40vw] relative h-full shrink-0 overflow-hidden cursor-pointer bg-black [transform:translateZ(0)]"
            >
              <Image
                loader={cloudinaryLoader}
                src={event.coverImage}
                alt={event.title}
                fill
                quality={85}
                sizes="(max-width: 768px) 90vw, (max-width: 1024px) 60vw, 40vw"
                className="object-cover"
                loading="eager"
                decoding="async"
                draggable={false}
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />

              <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8 lg:p-10 select-none">
                <span className="text-yellow font-bold text-xs sm:text-sm uppercase tracking-wider mb-2">
                  {isStantsiya(event.slug) ? <span className="flex items-end gap-2"><FaStar className="text-yellow h-6" /> наша постійна акція</span> : formatEventDate(event.eventDate, event.endDate, { mode: 'long' })}
                </span>
                <h4 className="text-white font-bold text-2xl sm:text-3xl lg:text-4xl uppercase mb-2 tracking-wider leading-tight">
                  {event.title}
                </h4>
                <span className="text-white text-xs sm:text-sm uppercase tracking-wider mb-8 max-w-md">
                  {event.shortDescription}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
