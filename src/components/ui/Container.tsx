import { cn } from '@/lib/utils';

const sizes = {
  xs: 'max-w-md',
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  default: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  full: '',
} as const;

interface ContainerProps {
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

export function Container({
  size = 'full',
  className,
  children,
  as: Tag = 'div',
}: ContainerProps) {
  return (
    <Tag className={cn('container mx-auto px-4', sizes[size], className)}>
      {children}
    </Tag>
  );
}
