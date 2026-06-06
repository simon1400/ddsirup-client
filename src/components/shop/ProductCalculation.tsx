'use client';

import { useEffect, useRef, useState } from 'react';
import type { ProductCalculation as ProductCalculationType } from '@/types/product';

const CALC_PALETTE = [
    '#8cafd4',
    '#eda561',
    '#769d73',
    '#6bc4c8',
] as const;

const ANIMATION_DURATION = 1500;

function useCountUp(target: number, duration = ANIMATION_DURATION) {
    const [value, setValue] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const start = performance.now();

        function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        }

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [target, duration]);

    return value;
}

interface ProductCalculationProps {
    calculation: ProductCalculationType;
    index?: number;
}

export function ProductCalculation({ calculation, index = 0 }: ProductCalculationProps) {
    const bg = CALC_PALETTE[index % CALC_PALETTE.length];
    const displayAmount = useCountUp(calculation.amount);

    return (
        <div
            className="rounded-2xl flex flex-col items-center justify-center px-6 py-8 md:px-8 md:py-10"
            style={{ backgroundColor: bg }}
        >
            <span className="font-black text-4xl md:text-5xl text-white leading-none">
                {displayAmount}x
            </span>
            <span className="mt-2 text-sm md:text-base text-white tracking-wide">
                {calculation.beverageName}
            </span>
        </div>
    );
}
