import type { ProductDirection } from '@/types/product';

const DIRECTION_PALETTE = [
  '#769d73ff',
  '#8cafd4ff',
  '#F08080',
  '#A8D5A2',
  '#F08080',
  '#C8D84E'
] as const;

interface DirectionSectionProps {
  direction: ProductDirection;
}

export function DirectionSection({ direction }: DirectionSectionProps) {
  const bg = DIRECTION_PALETTE[direction.id % DIRECTION_PALETTE.length];

    return (
        <div
          className="relative @container break-inside-avoid rounded-3xl overflow-hidden h-full w-full mx-auto"
          style={{ backgroundColor: bg }}
        >

          <div className="relative text-3xl z-10 px-8 py-10 md:py-14 h-full flex flex-col gap-6">

            <p className="font-black text-white opacity-90 leading-tight">
              {direction.beverageName}
            </p>

            <div className="flex flex-col gap-1">
              <span dangerouslySetInnerHTML={{ __html: direction.amount }} className="text-4xl md:text-5xl font-black text-white">
              </span>
            </div>

            {direction.addIn && (
              <div className="flex flex-col  gap-1">
                <span className="text-lg md:text-xl font-bold text-white">
                  {direction.addIn}
                </span>
              </div>
            )}
        </div>
      </div>
    );
}
