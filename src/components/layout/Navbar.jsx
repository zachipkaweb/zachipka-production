"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Button from "../ui/Button";

const links = [
  { href: "/", label: "Головна" },
  { href: "/climbing", label: "Скеледром" },
  { href: "/training", label: "Тренування" },
  { href: "/events", label: "Події" },
  { href: "/find-us", label: "Як нас знайти" },
  { href: "/contacts", label: "Контакти" },
];

const layerColors = ["#e0ec59", "#e0564a"];

const PRELOAD_HERO_IMAGES = [
  { src: "/images/climbing/hero.webp", sizes: "(max-width: 768px) 250vw, 100vw" },
  { src: "/images/training/training-hero.webp", sizes: "(max-width: 768px) 250vw, 100vw" },
  { src: "/images/events/events-hero.webp", sizes: "(max-width: 768px) 250vw, 100vw" },
  { src: "/images/find-us/bg.webp", sizes: "(max-width: 768px) 200vw, 100vw" },
  { src: "/images/contacts/hero.webp", sizes: "(max-width: 768px) 200vw, 100vw" },
];

// Animation timings (in milliseconds) for the mobile fullscreen menu
const OPEN_MS = 1200;
const CLOSE_MS = 320;

/**
 * Navbar Component
 * Features:
 * - Smart header hide on scroll down (300px threshold), reveal on scroll up (100px threshold) on desktop
 * - Layered full-screen mobile navigation overlay with staggered open/close animations
 * - Viewport height lock (--vh) to prevent jumpiness on mobile mobile browser address bar hide/show
 * - Idle/menu-triggered preloading of primary hero images for instant navigation
 */
export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("Меню");
  const [labelFading, setLabelFading] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [shouldPreload, setShouldPreload] = useState(false);
  const [preloadedCount, setPreloadedCount] = useState(0);

  const openRef = useRef(false);
  const busyRef = useRef(false);
  const busyTimerRef = useRef(null);
  const labelTimerRef = useRef(null);

  useEffect(() => {
    let lastWidth = window.innerWidth;
    const setLockedVh = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    setLockedVh();

    let lastScrollY = window.scrollY;
    let accumulatedDown = 0;
    let accumulatedUp = 0;
    let isHidden = false;

    // Desktop only: Smooth header auto-hide when scrolling down, reveal when scrolling up
    const handleScroll = () => {
      if (window.innerWidth < 1024) return;

      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (delta > 0) {
        accumulatedUp = 0;
        accumulatedDown += delta;

        if (accumulatedDown >= 300 && !isHidden) {
          isHidden = true;
          setHeaderHidden(true);
        }
      } else if (delta < 0) {
        accumulatedDown = 0;
        accumulatedUp += Math.abs(delta);

        if (accumulatedUp >= 100 && isHidden) {
          isHidden = false;
          setHeaderHidden(false);
        }
      }

      if (currentScrollY <= 0 && isHidden) {
        isHidden = false;
        setHeaderHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    const handleResize = () => {
      if (Math.abs(window.innerWidth - lastWidth) > 20) {
        lastWidth = window.innerWidth;
        setLockedVh();
      }
      if (window.innerWidth < 1024 && isHidden) {
        isHidden = false;
        setHeaderHidden(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(busyTimerRef.current);
      clearTimeout(labelTimerRef.current);
      document.body.style.overflow = "";
    };
  }, []);

  const animateText = useCallback((opening) => {
    setLabelFading(true);
    clearTimeout(labelTimerRef.current);
    labelTimerRef.current = setTimeout(() => {
      setLabel(opening ? "Закрити" : "Меню");
      setLabelFading(false);
    }, 150);
  }, []);

  const toggleMenu = useCallback(() => {
    if (busyRef.current) return;

    const target = !openRef.current;
    openRef.current = target;
    busyRef.current = true;
    setOpen(target);
    if (target) {
      setShouldPreload(true);
    }
    animateText(target);

    clearTimeout(busyTimerRef.current);
    busyTimerRef.current = setTimeout(
      () => {
        busyRef.current = false;
      },
      target ? OPEN_MS : CLOSE_MS
    );
  }, [animateText]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        toggleMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, toggleMenu]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 z-50 w-full transition-transform duration-350 ease-out ${
          headerHidden ? "-translate-y-full" : ""
        }`}
      >
        <div className="container relative mx-auto mt-2 flex p-4 items-center justify-between">
          <Link href="/" className="relative z-50">
            <Image
              src="/logo.svg"
              alt="Скеледром"
              width={54}
              height={76}
              className="h-12.5 w-auto"
            />
          </Link>

          <div className="hidden relative ps-4 bg-gray items-center gap-6 lg:flex">
            <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />
            {links.map((link) => (
              <Link key={link.label} href={link.href} className={`transition-colors ${
                    pathname === link.href ? "text-yellow" : "text-white"
                  }`}>
                {link.label}
              </Link>
            ))}
            <Button href="https://zachipka.gymsatellite.com/clients/auth" bg="white" color="gray">
              Кабінет
            </Button>
          </div>

          <button
            type="button"
            onClick={toggleMenu}
            className={`relative bg-gray px-2 z-50 lg:hidden overflow-hidden`}
            aria-label={open ? "Закрити меню" : "Відкрити меню"}
            aria-expanded={open}
          >
            <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />
            <span
              className={`relative z-10 text-sm text-white transition-opacity duration-150 ${
                labelFading ? "opacity-0" : "opacity-100"
              }`}
            >
              {label}
            </span>
          </button>
        </div>
      </nav>

      <div
        className={`nb-prelayers pointer-events-none fixed inset-y-0 right-0 z-40 w-full lg:hidden ${
          open ? "nb-menu-open" : ""
        }`}
        aria-hidden="true"
      >
        {layerColors.map((c, i) => (
          <div
            key={i}
            className="nb-prelayer absolute inset-y-0 right-0 w-full"
            style={{ background: c, "--nb-i": String(i) }}
          />
        ))}
      </div>

      <aside
        className={`nb-panel fixed inset-y-0 right-0 z-40 flex w-full flex-col justify-center gap-3 bg-gray p-8 pt-24 lg:hidden ${
          open ? "nb-menu-open" : ""
        }`}
        aria-hidden={!open}
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />
        {links.map((link, i) => (
          <div key={link.label} className="relative z-10 overflow-hidden">
            <Link
              href={link.href}
              onClick={toggleMenu}
              className="nb-item-label block text-4xl font-semibold uppercase leading-none tracking-tight text-white"
              style={{ "--nb-i": String(i) }}
            >
              {link.label}
            </Link>
          </div>
        ))}

        <div className="relative z-10 mt-4 overflow-hidden">
          <Link
            href="https://zachipka.gymsatellite.com/clients/auth"
            onClick={toggleMenu}
            className="nb-item-label inline-block bg-white px-6 py-3 font-medium text-black"
            style={{ "--nb-i": String(links.length) }}
          >
            Кабінет
          </Link>
        </div>
      </aside>

      {shouldPreload && preloadedCount < PRELOAD_HERO_IMAGES.length && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 -z-50 h-px w-px overflow-hidden opacity-0"
        >
          {PRELOAD_HERO_IMAGES.map((img) => (
            <Image
              key={img.src}
              src={img.src}
              alt=""
              fill
              quality={80}
              sizes={img.sizes}
              loading="eager"
              onLoad={() => setPreloadedCount((c) => c + 1)}
            />
          ))}
        </div>
      )}
    </>
  );
}
