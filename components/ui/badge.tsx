import * as React from 'react';
import clsx from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'accent' | 'brass' | 'subtle' | 'amber' | 'red' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'accent',
  size = 'md',
  ...props
}: BadgeProps) {
  const variantStyles = {
    accent: 'bg-[#41357e] text-[#f7f5f1] border-transparent',
    brass: 'bg-[#f5ddd2] text-[#813d26] border-[#ddd7e4]',
    subtle: 'bg-[#ece8fb] text-[#41357e] border-[#bbb2c8]',
    amber: 'bg-[#fae9e0] text-[#813d26] border-[#f5ddd2]',
    red: 'bg-[#fcebef] text-[#8b203a] border-[#f1bfcc]',
    outline: 'bg-transparent text-[var(--ink)] border-[var(--line)]',
    neutral: 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)]',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-sm border transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
