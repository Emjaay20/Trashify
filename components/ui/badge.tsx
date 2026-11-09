import * as React from 'react';
import clsx from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'forest' | 'brass' | 'sage' | 'amber' | 'red' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'forest',
  size = 'md',
  ...props
}: BadgeProps) {
  const variantStyles = {
    forest: 'bg-[#173E2C] text-[#FAF8F3] border-transparent',
    brass: 'bg-[#F2EAD3] text-[#7A5A12] border-[#E3DED0]',
    sage: 'bg-[#E9EFE6] text-[#173E2C] border-[#D6D0BE]',
    amber: 'bg-[#FEF6E0] text-[#7A5A12] border-[#F2EAD3]',
    red: 'bg-[#FDECEC] text-[#7A1F1F] border-[#FCD5D5]',
    outline: 'bg-transparent text-[var(--ink)] border-[var(--line)]',
    neutral: 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)]',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-0.5 tracking-wide',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-mono font-medium rounded-full border transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
