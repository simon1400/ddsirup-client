'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCollapseProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedCollapse({ open, children, className }: AnimatedCollapseProps) {
  const [showOverflow, setShowOverflow] = useState(false);

  // When closing, immediately hide overflow
  useEffect(() => {
    if (!open) setShowOverflow(false);
  }, [open]);

  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-300 ease-in-out',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className
      )}
      onTransitionEnd={() => {
        if (open) setShowOverflow(true);
      }}
    >
      <div className={showOverflow ? '' : 'overflow-hidden'}>{children}</div>
    </div>
  );
}
