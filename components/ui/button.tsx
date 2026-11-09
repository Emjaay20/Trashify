import * as React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-[#173E2C] text-[#FAF8F3] hover:bg-[#1E4D36] active:bg-[#133324] shadow-sm',
      secondary: 'bg-[#F3F0E8] text-[#1A1E1B] hover:bg-[#EDE9DD] border border-[#E3DED0]',
      outline: 'bg-transparent text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--surface-2)]',
      ghost: 'bg-transparent text-[var(--ink)] hover:bg-[var(--surface-2)]',
      danger: 'bg-[#7A1F1F] text-white hover:bg-[#922626]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-medium rounded-md',
      md: 'px-4 py-2.5 text-sm font-medium rounded-lg',
      lg: 'px-5 py-3 text-base font-medium rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
