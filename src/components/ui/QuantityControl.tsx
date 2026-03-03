'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<Size, { btn: string; icon: string; span: string }> = {
  sm: { btn: 'h-6 w-6', icon: 'h-3 w-3', span: 'w-6 text-sm text-center' },
  md: { btn: 'h-8 w-8', icon: 'h-3 w-3', span: 'w-8 text-center' },
  lg: { btn: 'h-10 w-10', icon: 'h-4 w-4', span: 'w-10 text-center text-sm font-medium' },
};

interface QuantityControlProps {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
  /** sm = drawer, md = cart row, lg = product detail */
  size?: Size;
  /** Wrap with a border rounded-md container (product detail style) */
  bordered?: boolean;
}

export function QuantityControl({
  value,
  onDecrement,
  onIncrement,
  min = 1,
  max,
  size = 'md',
  bordered = false,
}: QuantityControlProps) {
  const s = SIZE_MAP[size];
  const variant = bordered ? 'ghost' : 'outline';

  const buttons = (
    <>
      <Button
        variant={variant}
        size="icon"
        className={cn(s.btn, bordered && 'rounded-r-none')}
        onClick={onDecrement}
        disabled={value <= min}
      >
        <Minus className={s.icon} />
      </Button>
      <span className={s.span}>{value}</span>
      <Button
        variant={variant}
        size="icon"
        className={cn(s.btn, bordered && 'rounded-l-none')}
        onClick={onIncrement}
        disabled={max !== undefined && value >= max}
      >
        <Plus className={s.icon} />
      </Button>
    </>
  );

  if (bordered) {
    return <div className="flex items-center border rounded-md">{buttons}</div>;
  }

  return <div className="flex items-center gap-2">{buttons}</div>;
}
