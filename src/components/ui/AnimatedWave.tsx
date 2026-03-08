/**
 * Animated wave SVG using SMIL <animate> for cross-browser support.
 * CSS `d: path()` animation is NOT supported on Safari/iOS — SMIL works everywhere.
 */

const BREATHE_1_VALUES = [
  'M0,40 C120,80 200,80 320,35 S520,-10 640,40 S840,85 960,35 S1160,-10 1280,40 S1480,85 1600,35 S1800,-5 1920,40 L1920,120 L0,120 Z',
  'M0,35 C120,85 200,85 320,55 S520,100 640,50 S840,5 960,55 S1160,95 1280,35 S1480,-5 1600,40 S1800,80 1920,35 L1920,120 L0,120 Z',
  'M0,50 C120,10 200,10 320,55 S520,100 640,50 S840,5 960,40 S1160,-10 1280,50 S1480,90 1600,55 S1800,100 1920,50 L1920,120 L0,120 Z',
  'M0,40 C120,80 200,80 320,35 S520,-10 640,40 S840,85 960,35 S1160,-10 1280,40 S1480,85 1600,35 S1800,-5 1920,40 L1920,120 L0,120 Z',
].join(';');

const BREATHE_2_VALUES = [
  'M0,45 C150,85 250,90 400,35 S650,-5 800,45 S1050,90 1200,35 S1450,-5 1600,45 S1800,80 1920,45 L1920,120 L0,120 Z',
  'M0,50 C150,10 250,5 400,50 S650,90 800,40 S1050,-5 1200,45 S1450,85 1600,50 S1800,95 1920,50 L1920,120 L0,120 Z',
  'M0,40 C150,5 250,0 400,55 S650,100 800,50 S1050,5 1200,55 S1450,95 1600,40 S1800,0 1920,40 L1920,120 L0,120 Z',
  'M0,45 C150,85 250,90 400,35 S650,-5 800,45 S1050,90 1200,35 S1450,-5 1600,45 S1800,80 1920,45 L1920,120 L0,120 Z',
].join(';');

const EASE_SPLINES = '0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1';

interface AnimatedWaveProps {
  position: 'top' | 'bottom';
}

export function AnimatedWave({ position }: AnimatedWaveProps) {
  const isTop = position === 'top';

  return (
    <div
      className={`relative w-full overflow-hidden leading-none ${
        isTop ? '-top-px rotate-180' : '-bottom-px'
      }`}
    >
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
        >
          <animate
            attributeName="d"
            dur="4.5s"
            repeatCount="indefinite"
            values={BREATHE_1_VALUES}
            keyTimes="0;0.33;0.66;1"
            calcMode="spline"
            keySplines={EASE_SPLINES}
          />
        </path>
        <path
          d="M0,45 C150,85 250,90 400,35 S650,-5 800,45 S1050,90 1200,35 S1450,-5 1600,45 S1800,80 1920,45 L1920,120 L0,120 Z"
          fill="rgba(255,255,255,0.5)"
        >
          <animate
            attributeName="d"
            dur="5.5s"
            repeatCount="indefinite"
            values={BREATHE_2_VALUES}
            keyTimes="0;0.33;0.66;1"
            calcMode="spline"
            keySplines={EASE_SPLINES}
          />
        </path>
      </svg>
    </div>
  );
}
