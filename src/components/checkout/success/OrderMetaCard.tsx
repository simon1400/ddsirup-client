import type { ReactNode } from 'react';

interface OrderMetaCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

export function OrderMetaCard({ icon, label, value, highlight }: OrderMetaCardProps) {
  return (
    <div className="bg-muted/50 rounded-2xl p-4 text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white mb-2">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`font-bold text-md truncate ${highlight ? 'text-coral' : ''}`}>
        {value}
      </p>
    </div>
  );
}
