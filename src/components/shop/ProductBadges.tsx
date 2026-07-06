import type { Badge } from '@/types/product';
import { cn } from '@/lib/utils';

interface ProductBadgesProps {
  badges?: Badge[];
  /** "overlay" = absolute pills stacked in the image corner (card); "inline" = a wrapping row (detail page). */
  variant?: 'overlay' | 'inline';
  /** Which corner the overlay sits in (overlay variant only). */
  corner?: 'left' | 'right';
  className?: string;
}

const DEFAULT_BADGE_COLOR = '#F47070'; // brand coral fallback

/** Pick a readable text color (dark/white) for a given badge background. */
function readableText(hex?: string): string {
  if (!hex) return '#ffffff';
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (full.length !== 6) return '#ffffff';
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1a1a1a' : '#ffffff';
}

export function ProductBadges({ badges, variant = 'inline', corner = 'left', className }: ProductBadgesProps) {
  if (!badges || badges.length === 0) return null;

  const pills = badges.map((badge) => {
    const bg = badge.badgeColor || DEFAULT_BADGE_COLOR;
    return (
      <span
        key={badge.id}
        className={cn(
          'inline-flex items-center rounded-full font-bold uppercase tracking-wide whitespace-nowrap',
          variant === 'overlay' ? 'px-2.5 py-0.5 text-[0.65rem]' : 'px-2.5 py-0.5 text-[0.7rem]'
        )}
        style={{ backgroundColor: bg, color: readableText(bg) }}
      >
        {badge.badgeName}
      </span>
    );
  });

  if (variant === 'overlay') {
    return (
      <div
        className={cn(
          'pointer-events-none absolute top-3 z-10 flex flex-col gap-1',
          corner === 'right' ? 'right-3 items-end' : 'left-3 items-start',
          className
        )}
      >
        {pills}
      </div>
    );
  }

  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{pills}</div>;
}
