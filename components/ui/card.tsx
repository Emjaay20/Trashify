import * as React from 'react';
import clsx from 'clsx';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('p-5 border-b border-[var(--line)]', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('p-5', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('p-5 border-t border-[var(--line)] bg-[var(--surface-2)]/50 rounded-b-xl', className)}
      {...props}
    />
  );
}
