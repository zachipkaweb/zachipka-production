"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../ui/Button";

function MagneticButtonLink({ href, className, children, onClick }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.08;
    const deltaY = (e.clientY - centerY) * 0.1;
    setOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <Link
      href={href}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/noise.png')] bg-repeat opacity-[0.04]" />
      <span
        className="relative z-10 pointer-events-none block will-change-transform"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: isHovered
            ? "transform 0.12s ease-out"
            : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {children}
      </span>
    </Link>
  );
}

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const closeTimerRef = useRef(null);
  const videoRef = useRef(null);

  const openModal = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    setIsModalOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalVisible(true);
      });
    });
  };

  const closeModal = () => {
    setIsModalVisible(false);
    closeTimerRef.current = setTimeout(() => {
      setIsModalOpen(false);
    }, 350);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      video.play().catch(() => {});
    }
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <section className="relative h-svh w-full overflow-hidden bg-black">
      <Image
        src="/images/hero/hero-poster.webp"
        alt="Скеледром Зачіпка"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <video
        ref={videoRef}
        onPlaying={() => setIsVideoPlaying(true)}
        className={`hero-bg-video pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isVideoPlaying ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/videos/hero.webm" type="video/webm" />
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-78 overflow-hidden mask-[linear-gradient(to_top,black,transparent)]">
        <div className="hero-noise-animated opacity-10" />
      </div>

      <div className="container relative z-10 mx-auto flex h-full flex-col items-start justify-end gap-8 px-6 pb-10 text-white sm:pb-16 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl uppercase leading-tight sm:text-5xl lg:text-6xl">
            ЛІЗТИ ВГОРУ — <br />НЕ СТРАШНО.
          </h1>
          <p className="max-w-xl text-sm sm:text-base">
            Від першого знайомства зі скелелазінням до тренувань, які стали частиною твого тижня.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
            <Button onClick={openModal}>
              Записатись на тренування
            </Button>
            <Button href="/find-us" bg="gray" color="white" uppercase>
              Як нас знайти?
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-sm sm:text-base">
          <p>
            м. Івано-Франківськ вул. <br />
            Української Перемоги 23Д
          </p>
          <div className="flex items-center justify-between gap-4">
            <p>Пн-Пт</p>
            <p>12:00–22:00</p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <p>Сб–Нд</p>
            <p>10:00–20:00</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-end justify-center transition-all duration-400 ease-out ${
            isModalVisible
              ? "bg-black/30 backdrop-blur-[2px]"
              : "bg-black/0 backdrop-blur-none"
          }`}
          onClick={closeModal}
        >
          <div
            className="relative w-full h-1/2 min-h-60 pt-10 text-white overflow-hidden flex flex-col justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className={`absolute top-0 right-0 z-20 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-black/40 hover:bg-black/70 text-white/90 hover:text-white transition-opacity duration-300 cursor-pointer p-1 ${
                isModalVisible ? "opacity-100" : "opacity-0"
              }`}
              aria-label="Закрити"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="relative z-10 grid grid-cols-2 w-full h-full overflow-hidden">
              <div
                className="w-full h-full"
                style={{
                  transform: isModalVisible
                    ? "translateY(0%)"
                    : "translateY(100%)",
                  transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: isModalVisible ? "0.04s" : "0s",
                  willChange: "transform",
                }}
              >
                <MagneticButtonLink
                  href="https://zachipka.gymsatellite.com/client_book_time/locations"
                  className="w-full h-full p-4 sm:p-6 lg:p-8 bg-yellow hover:brightness-105 transition-all text-center text-base sm:text-2xl md:text-3xl lg:text-4xl uppercase flex items-center justify-center text-gray font-bold tracking-wider"
                  onClick={closeModal}
                >
                  Перейти до запису
                </MagneticButtonLink>
              </div>

              <div
                className="w-full h-full"
                style={{
                  transform: isModalVisible
                    ? "translateY(0%)"
                    : "translateY(100%)",
                  transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: isModalVisible ? "0.18s" : "0s",
                  willChange: "transform",
                }}
              >
                <MagneticButtonLink
                  href="/training"
                  className="w-full h-full p-4 sm:p-6 lg:p-8 bg-gray hover:brightness-105 transition-all text-center text-base sm:text-2xl md:text-3xl lg:text-4xl uppercase flex items-center justify-center text-yellow font-bold tracking-wider"
                  onClick={closeModal}
                >
                  Ознайомитись з тренуваннями
                </MagneticButtonLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}