'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { HeroProps } from '@/types/homepage';
import { CATEGORY_COLORS } from '@/lib/constants';
import { getStrapiImageUrl } from '@/lib/utils';

interface Props {
  hero: HeroProps;
}

/** Check if the user is on a slow connection or has data-saver enabled */
function shouldLoadVideo(): boolean {
  if (typeof navigator === 'undefined') return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (!conn) return true;
  if (conn.saveData) return false;
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return false;
  return true;
}

export function HeroSection({ hero }: Props) {
  const videoUrl = hero.video?.url ? getStrapiImageUrl(hero.video.url) : null;
  const posterImage = hero.posterImage;
  const categories = hero.categories ?? [];

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [canLoadVideo, setCanLoadVideo] = useState(false);

  // After hydration, decide whether to load video based on connection quality
  useEffect(() => {
    if (videoUrl && shouldLoadVideo()) {
      setCanLoadVideo(true);
    }
  }, [videoUrl]);

  // Try to play video once it can play through — detect autoplay block
  const handleCanPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().then(() => {
      setVideoReady(true);
    }).catch(() => {
      // Autoplay blocked (battery saver, user settings, etc.)
      setVideoFailed(true);
    });
  }, []);

  const handleError = useCallback(() => {
    setVideoFailed(true);
  }, []);

  // Poster image URL — prefer responsive formats for faster load
  const posterSrc = posterImage
    ? getStrapiImageUrl(
        posterImage.formats?.large?.url ??
        posterImage.formats?.medium?.url ??
        posterImage.url
      )
    : null;

  // Small blurry placeholder for instant display
  const posterBlurSrc = posterImage
    ? getStrapiImageUrl(
        posterImage.formats?.thumbnail?.url ??
        posterImage.formats?.small?.url ??
        posterImage.url
      )
    : null;

  const showVideo = canLoadVideo && videoUrl && !videoFailed;

  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background layers — poster always present, video fades in on top */}

      {/* Layer 1: Solid color fallback (instant) */}
      <div className="absolute inset-0 bg-[#2a3a2a]" />

      {/* Layer 2: Poster image */}
      {posterSrc && (
        <Image
          src={posterSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder={posterBlurSrc ? 'blur' : 'empty'}
          blurDataURL={posterBlurSrc ?? undefined}
          className="absolute inset-0 object-cover"
        />
      )}

      {/* Layer 3: Video (lazy, fades in when ready) */}
      {showVideo && (
        <video
          ref={videoRef}
          src={videoUrl!}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlayThrough={handleCanPlay}
          onError={handleError}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: videoReady ? 1 : 0 }}
        />
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
            className="text-2xl md:text-4xl font-semibold mb-10"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.95), 0 4px 24px rgba(0,0,0,0.7)' }}
          >
            {hero.subtitle}
          </p>
        )}

        {/* Category buttons */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-5 md:gap-10 justify-center">
            {categories.slice(0, 2).map((cat, i) => (
              <Link
                key={cat.documentId}
                href={`/produkty?tab=${cat.slug}`}
                className="px-20 md:px-30 py-6 rounded-full font-bold uppercase text-lg tracking-widest text-gray-900 transition-opacity hover:opacity-90"
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
