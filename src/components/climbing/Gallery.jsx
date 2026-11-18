"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Image from "next/image";

gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });

const images = [
  { src: "/images/climbing/space/1.webp", alt: "Галерея простору 1" },
  { src: "/images/climbing/space/2.webp", alt: "Галерея простору 2" },
  { src: "/images/climbing/space/3.webp", alt: "Галерея простору 3" },
  { src: "/images/climbing/space/4.webp", alt: "Галерея простору 4" },
  { src: "/images/climbing/space/5.webp", alt: "Галерея простору 5" },
  { src: "/images/climbing/space/6.webp", alt: "Галерея простору 6" },
  { src: "/images/climbing/space/7.webp", alt: "Галерея простору 7" },
  { src: "/images/climbing/space/8.webp", alt: "Галерея простору 8" },
  { src: "/images/climbing/space/9.webp", alt: "Галерея простору 9" },
  { src: "/images/climbing/space/10.webp", alt: "Галерея простору 10" },
  { src: "/images/climbing/space/11.webp", alt: "Галерея простору 11" },
  { src: "/images/climbing/space/12.webp", alt: "Галерея простору 12" },
  { src: "/images/climbing/space/13.webp", alt: "Галерея простору 13" },
];

const DESKTOP_MQ = "(min-width: 768px)";

export default function Gallery() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

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
    <section
      id="gallery"
      ref={sectionRef}
      className="gallery-section relative w-full overflow-x-auto bg-black md:h-svh md:overflow-hidden"
    >
      <div
        ref={trackRef}
        className="flex h-[calc(var(--vh,1svh)*70)] w-max md:h-full md:w-fit md:will-change-transform"
      >
        {images.map((img) => (
          <div
            key={img.src}
            className="relative h-full w-[85vw] md:w-[80vw] lg:w-[65vw] xl:w-[40vw] shrink-0 overflow-hidden [transform:translateZ(0)]"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              quality={85}
              sizes="(max-width: 768px) 90vw, (max-width: 1024px) 80vw, (max-width: 1280px) 65vw, 40vw"
              className="object-cover"
              loading="eager"
              decoding="async"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </section>
  );
}