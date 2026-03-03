import type { TextSection as TextSectionType } from '@/types/homepage';

interface Props {
  section: TextSectionType;
}

export function TextSection({ section }: Props) {
  return (
    <section className="relative bg-coral">
      {/* Wave top */}
      <div className="relative -top-px w-full overflow-hidden leading-none rotate-180">
        <svg
          viewBox="0 0 1920 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block w-full"
          style={{ height: 'clamp(60px, 10vw, 140px)' }}
        >
          <path
            d="M0,40 C120,80 200,80 320,35 S520,-10 640,40 S840,85 960,35 S1160,-10 1280,40 S1480,85 1600,35 S1800,-5 1920,40 L1920,120 L0,120 Z"
            fill="white"
            style={{ animation: 'wave-breathe-1 4.5s ease-in-out infinite' }}
          />
          <path
            d="M0,45 C150,85 250,90 400,35 S650,-5 800,45 S1050,90 1200,35 S1450,-5 1600,45 S1800,80 1920,45 L1920,120 L0,120 Z"
            fill="rgba(255,255,255,0.5)"
            style={{ animation: 'wave-breathe-2 5.5s ease-in-out infinite' }}
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-3xl text-center py-16 md:py-24 px-4">
        {section.title && (
          <h2 className="text-3xl md:text-8xl font-black uppercase mb-6 text-white">
            {section.title}
          </h2>
        )}
        {section.content && (
          <div
            className="prose prose-lg mx-auto text-white/90 prose-p:text-white/90 prose-strong:text-white text-2xl md:text-3xl"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        )}
      </div>

      {/* Wave bottom */}
      <div className="relative -bottom-px w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1920 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block w-full"
          style={{ height: 'clamp(60px, 10vw, 140px)' }}
        >
          <path
            d="M0,40 C120,80 200,80 320,35 S520,-10 640,40 S840,85 960,35 S1160,-10 1280,40 S1480,85 1600,35 S1800,-5 1920,40 L1920,120 L0,120 Z"
            fill="white"
            style={{ animation: 'wave-breathe-1 4.5s ease-in-out infinite 1s' }}
          />
          <path
            d="M0,45 C150,85 250,90 400,35 S650,-5 800,45 S1050,90 1200,35 S1450,-5 1600,45 S1800,80 1920,45 L1920,120 L0,120 Z"
            fill="rgba(255,255,255,0.5)"
            style={{ animation: 'wave-breathe-2 5.5s ease-in-out infinite 0.5s' }}
          />
        </svg>
      </div>
    </section>
  );
}
