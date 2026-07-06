"use client";

import { useState, useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";

interface Props {
  partnersNumber?: number;
}

/** Deterministic pseudo-random in [0,1) — keeps SSR and client output identical. */
function rand(i: number, salt: number): number {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const SYRUP_BUBBLE_COUNT = 18;

/** Syrup never reaches the brim — leave headroom so the waves read as a surface. */
const MAX_FILL = 90;

/** Carbonation rising through the syrup inside the glass. */
function SyrupBubbles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: SYRUP_BUBBLE_COUNT }).map((_, i) => {
        const size = 2.5 + rand(i, 1) * 5; // 2.5–7.5px
        const left = 6 + rand(i, 2) * 88; // 6–94%
        const duration = 5 + rand(i, 3) * 6; // 5–11s
        const delay = -(rand(i, 4) * 11); // negative → pre-filled, scattered
        const drift = (rand(i, 5) - 0.5) * 30; // horizontal sway
        const opacity = 0.24 + rand(i, 6) * 0.3; // 0.24–0.54
        return (
          <span
            key={i}
            className="recipe-bubble"
            style={
              {
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                "--bubble-bg": "rgba(255,255,255,0.9)",
                "--bubble-dur": `${duration}s`,
                "--bubble-delay": `${delay}s`,
                "--bubble-drift": `${drift}px`,
                "--bubble-o": opacity,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

/** A single tileable wave of syrup surface (4 humps across the glass width). */
function WaveTile({ fill }: { fill: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      preserveAspectRatio="none"
      className="h-full w-1/2 shrink-0"
    >
      <path
        d="M0 12 Q 15 3 30 12 T 60 12 T 90 12 T 120 12 V24 H0 Z"
        fill={fill}
      />
    </svg>
  );
}

/** Animated, undulating syrup surface that rides on top of the liquid.
    The band overlaps the liquid body so the crests rise above the surface
    while the troughs stay flush with it — no seam, nothing clipped. */
function SyrupWave() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-6 -translate-y-[85%]">
      <div className="absolute inset-0 flex w-[200%] animate-[wave-flow_5s_linear_infinite] motion-reduce:animate-none">
        <WaveTile fill="var(--color-coral)" />
        <WaveTile fill="var(--color-coral)" />
      </div>
    </div>
  );
}

/** Droplet splash that pops once the syrup finishes filling the number. */
function SyrupSplash() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-2 flex justify-center">
      <div className="relative h-1 w-40">
        {Array.from({ length: 5 }).map((_, i) => {
          const size = 6 + rand(i, 7) * 8; // 6–14px
          const x = (rand(i, 8) - 0.5) * 120; // spread across the top
          const rise = -(26 + rand(i, 9) * 30); // -26 to -56px
          const dur = 0.9 + rand(i, 10) * 0.5;
          const delay = rand(i, 11) * 0.18;
          return (
            <span
              key={i}
              className="syrup-drop left-1/2"
              style={
                {
                  width: `${size}px`,
                  height: `${size}px`,
                  marginLeft: `${-size / 2}px`,
                  "--drop-x": `${x}px`,
                  "--drop-rise": `${rise}px`,
                  "--drop-dur": `${dur}s`,
                  "--drop-delay": `${delay}s`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}

/** Normalized (objectBoundingBox) tumbler silhouette — shared by the fill clip
    and the visible outline so the syrup stays perfectly inside the glass. */
const GLASS_PATH =
  "M0.085,0.02 L0.915,0.02 L0.855,0.85 Q0.845,0.965 0.73,0.965 L0.27,0.965 Q0.155,0.965 0.145,0.85 Z";

interface SyrupGlassProps {
  value: number;
  fill: number; // 0–100
  filled: boolean;
  className?: string;
}

function SyrupGlass({ value, fill, filled, className = "" }: SyrupGlassProps) {
  return (
    <div
      className={`relative w-50 sm:w-57.5 aspect-5/6 ${className}`}
    >
      {/* clip path that constrains the syrup to the glass interior */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <clipPath id="ddSyrupGlassClip" clipPathUnits="objectBoundingBox">
            <path d={GLASS_PATH} />
          </clipPath>
        </defs>
      </svg>

      {filled && <SyrupSplash />}

      {/* Syrup, clipped to the glass shape */}
      <div
        className="absolute inset-0"
        style={{ clipPath: "url(#ddSyrupGlassClip)" }}
      >
        <div
          className="absolute inset-x-0 bottom-0 bg-coral"
          style={{ height: `${fill}%`, containerType: "size" }}
        >
          <SyrupWave />
          <SyrupBubbles />
        </div>
      </div>

      {/* Glass outline drawn on top — non-scaling stroke keeps it crisp */}
      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <path
          d={GLASS_PATH}
          fill="none"
          stroke="var(--color-coral)"
          strokeWidth={3}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Partner count, sitting on top of the syrup */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-5xl sm:text-7xl font-bold uppercase tabular-nums leading-none ${
            filled ? "animate-[syrup-pop_1s_ease-out_1]" : ""
          }`}
          style={{
            letterSpacing: "-0.05em",
            textShadow:
              "0 1px 0 rgba(255,255,255,0.9), 0 0 14px rgba(255,255,255,0.85)",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export function PartnersCounterSection({ partnersNumber }: Props) {
  const targetNumber = partnersNumber ?? 51;
  const [displayNumber, setDisplayNumber] = useState(0);
  const [fill, setFill] = useState(0); // 0–100, syrup level inside the number
  const [filled, setFilled] = useState(false); // true once the pour completes
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isIntersecting) {
      setDisplayNumber(0);
      setFill(0);
      setFilled(false);
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDisplayNumber(targetNumber);
      setFill(MAX_FILL);
      setFilled(true);
      return;
    }

    let startTimestamp: number | null = null;
    const duration = 3200;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // easeInOutQuad — gentle start, smooth steady pour, soft settle
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      setDisplayNumber(Math.round(eased * targetNumber));
      setFill(eased * MAX_FILL);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setFilled(true);
      }
    };

    const animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isIntersecting, targetNumber]);

  return (
    <section ref={sectionRef} className="py-20 overflow-hidden">
      <Container size="xl">
        <p className="text-center text-xs md:text-sm font-bold uppercase tracking-[0.22em] text-coral mb-7">
          Kolik podniků už s námi spolupracuje?
        </p>

        {/* A real tumbler glass that fills with coral syrup as the number counts
            up. Syrup rises inside the glass, carbonation bubbles drift up through
            it, and the partner count sits on top. */}
        <SyrupGlass
          value={displayNumber}
          fill={fill}
          filled={filled}
          className="mx-auto mb-8"
        />

        <p className="mx-auto max-w-xl text-center text-2xl md:text-3xl font-light leading-snug text-foreground/70">
          <span className="font-semibold text-coral">
            Barů, kaváren a restaurací
          </span>
          <span className="block">po celé ČR.</span>
        </p>
      </Container>
    </section>
  );
}
