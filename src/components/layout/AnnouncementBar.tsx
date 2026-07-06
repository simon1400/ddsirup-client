import { Truck } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';

/**
 * Slim promotional strip pinned above the header.
 * Communicates the free-shipping threshold sitewide.
 */
export function AnnouncementBar() {
  return (
    <div className="announce-bar relative overflow-hidden bg-coral text-white">
      <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-2 text-center">
        <Truck className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
        <p className="text-[13px] font-semibold tracking-wide sm:text-sm">
          Doprava <span className="font-bold uppercase">zdarma</span> při objednávce nad{' '}
          <span className="font-bold">{FREE_SHIPPING_THRESHOLD}&nbsp;Kč</span>
        </p>
      </div>
    </div>
  );
}
