'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { BottleUsageSection as BottleUsageSectionType, UsageItem } from '@/types/homepage';
import { Container } from '@/components/ui/Container';
import { getStrapiImageUrl } from '@/lib/utils';

interface Props {
  section: BottleUsageSectionType;
}

/** Fallback — real product photo (Doe & Deer sirup Malina 1 l) with cut-out background. */
const DEFAULT_BOTTLE = { src: '/malina-bottle.webp', width: 417, height: 1666 };

type Side = 'left' | 'right';
/** Which way the line fans while moving outward from the bottle. */
type Dir = 'up' | 'down';

/** Hand-drawn curved connector between the bottle and a label.
    The curve stretches with the row; the arrowhead keeps a fixed size. */
function ConnectorLine({
  side,
  dir,
  visible,
  delay,
}: {
  side: Side;
  dir: Dir;
  visible: boolean;
  delay: number;
}) {
  // 100×40 viewBox, path always starts at the bottle so the draw-in
  // animation runs from the bottle outward.
  const paths: Record<Side, Record<Dir, string>> = {
    left: {
      up: 'M100 29 C 66 27, 30 13, 7 13',
      down: 'M100 11 C 66 13, 30 27, 7 27',
    },
    right: {
      up: 'M0 29 C 34 27, 70 13, 93 13',
      down: 'M0 11 C 34 13, 70 27, 93 27',
    },
  };
  const endY = dir === 'up' ? 13 : 27; // label-end y in viewBox units

  return (
    <div className="relative flex-1 min-w-6 text-foreground/30" aria-hidden>
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="h-10 w-full overflow-visible md:h-14"
      >
        <path
          d={paths[side][dir]}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={visible ? 0 : 100}
          style={{ transition: `stroke-dashoffset 0.8s ease-out ${delay}s` }}
          className="motion-reduce:[stroke-dashoffset:0]"
        />
      </svg>
      {/* fixed-size arrowhead at the label end */}
      <svg
        width="9"
        height="12"
        viewBox="0 0 9 12"
        className="absolute -translate-y-1/2 motion-reduce:opacity-100"
        style={{
          [side]: '3%',
          top: `${(endY / 40) * 100}%`,
          opacity: visible ? 1 : 0,
          transition: `opacity 0.3s ease ${delay + 0.7}s`,
        }}
      >
        <path
          d={side === 'left' ? 'M8 1 L1.5 6 L8 11' : 'M1 1 L7.5 6 L1 11'}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** "25× limonád" — the number counts up once the section scrolls into view. */
function UsageLabel({
  item,
  visible,
  delay,
}: {
  item: UsageItem;
  visible: boolean;
  delay: number;
}) {
  // Admins may type "25", "25×" or "25x" — the × glyph is always ours.
  const raw = item.count.trim().replace(/[×x]\s*$/i, '');
  const target = parseInt(raw, 10);
  const suffix = Number.isNaN(target) ? '' : raw.replace(String(target), '');
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible || Number.isNaN(target)) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setValue(target);
      return;
    }

    let frame = 0;
    let start: number | null = null;
    const duration = 1200;

    const timer = window.setTimeout(() => {
      const step = (t: number) => {
        if (start === null) start = t;
        const progress = Math.min((t - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) frame = window.requestAnimationFrame(step);
      };
      frame = window.requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
    };
  }, [visible, target, delay]);

  return (
    <div
      className="shrink-0 text-center motion-reduce:opacity-100 motion-reduce:translate-y-0"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      <div className="text-3xl font-black leading-none tabular-nums md:text-5xl">
        {Number.isNaN(target) ? raw : value}
        {suffix}
        <span className="sr-only">×</span>
        {/* the font's × glyph is a puffy cross at black weight — draw our own */}
        <svg
          viewBox="0 0 12 12"
          className="ml-1 inline-block h-[0.44em] w-[0.44em] text-coral"
          aria-hidden
        >
          <path
            d="M2 2 L10 10 M10 2 L2 10"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      <div className="mt-1.5 text-base font-medium text-foreground/70 md:text-xl">
        {item.label}
      </div>
    </div>
  );
}

export function BottleUsageSection({ section }: Props) {
  const items = section.items ?? [];
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  const leftItems = items.filter((_, i) => i % 2 === 0);
  const rightItems = items.filter((_, i) => i % 2 === 1);
  const bottleSrc = getStrapiImageUrl(section.bottleImage?.url) ?? DEFAULT_BOTTLE.src;
  const bottleWidth = section.bottleImage?.width ?? DEFAULT_BOTTLE.width;
  const bottleHeight = section.bottleImage?.height ?? DEFAULT_BOTTLE.height;
  const bottleAlt = section.bottleImage?.alternativeText ?? 'Doe & Deer sirup Malina 1 l';

  const renderColumn = (columnItems: UsageItem[], side: Side) => (
    <div className="flex flex-col justify-between gap-6 self-stretch py-4 md:py-8">
      {columnItems.map((item, i) => {
        const dir: Dir = i < columnItems.length / 2 ? 'up' : 'down';
        const delay = 0.15 + items.indexOf(item) * 0.12;
        const label = <UsageLabel key="label" item={item} visible={visible} delay={delay} />;
        const line = (
          <ConnectorLine key="line" side={side} dir={dir} visible={visible} delay={delay} />
        );
        return (
          <div key={item.id} className="flex items-center gap-1 md:gap-2">
            {side === 'left' ? [label, line] : [line, label]}
          </div>
        );
      })}
    </div>
  );

  return (
    <section ref={sectionRef} className="overflow-hidden py-20">
      <Container size="xl">
        {section.title && (
          <h2 className="mb-12 text-center text-3xl font-black uppercase md:text-6xl">
            {section.title}
          </h2>
        )}

        <div className="mx-auto grid max-w-4xl grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-3">
          {renderColumn(leftItems, 'left')}

          <Image
            src={bottleSrc}
            alt={bottleAlt}
            width={bottleWidth}
            height={bottleHeight}
            className="h-72 w-auto sm:h-96 md:h-120"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease',
            }}
          />

          {renderColumn(rightItems, 'right')}
        </div>
      </Container>
    </section>
  );
}
