'use client';

import Link from 'next/link';
import type { HeroProps } from '@/types/homepage';
import { CATEGORY_COLORS } from '@/lib/constants';

interface Props {
  hero: HeroProps;
}

export function HeroSection({ hero }: Props) {
  const videoUrl = hero.video?.url ?? null;
  const categories = hero.categories ?? [];

  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background video */}
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gray-800" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1
          className="text-6xl md:text-9xl font-black uppercase leading-none mb-4"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 6px 40px rgba(0,0,0,0.7)' }}
        >
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p
            className="text-xl md:text-4xl font-semibold mb-10"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.95), 0 4px 24px rgba(0,0,0,0.7)' }}
          >
            {hero.subtitle}
          </p>
        )}

        {/* Category buttons */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-10 justify-center">
            {categories.slice(0, 2).map((cat, i) => (
              <Link
                key={cat.documentId}
                href={`/products?tab=${cat.slug}`}
                className="px-30 py-6 rounded-full font-bold uppercase text-lg tracking-widest text-gray-900 transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: cat.color ?? CATEGORY_COLORS[i] ?? '#F0D060',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Scroll arrow */}
      <div
        className="absolute z-10 left-1/2 -translate-x-1/2"
        style={{ bottom: 'calc(clamp(60px, 10vw, 140px) + 16px)' }}
      >
      <button
        onClick={() => window.scrollTo({ top: window.innerHeight * 0.95, behavior: 'smooth' })}
        aria-label="Scrollovat dolů"
        className="text-white/80 hover:text-white transition-colors block cursor-pointer"
        style={{ animation: 'arrow-bounce 1.6s ease-in-out infinite' }}
      >
        <svg width="72" height="72" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 10L18 20L27 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 18L18 28L27 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        </svg>
      </button>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 2880 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{
            display: 'block',
            width: '200%',
            height: 'clamp(60px, 10vw, 140px)',
            animation: 'wave-flow 8s linear infinite',
          }}
        >
          <path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 C1680,120 1920,0 2160,60 C2400,120 2640,0 2880,60 L2880,120 L0,120 Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
