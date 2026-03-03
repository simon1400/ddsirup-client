'use client';

import { cn } from '@/lib/utils';

interface AnimatedCollapseProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedCollapse({ open, children, className }: AnimatedCollapseProps) {
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-300 ease-in-out',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
