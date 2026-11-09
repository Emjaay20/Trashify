'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Calendar, Truck, Activity, ShieldCheck, Home } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/book', label: 'Book Pickup', icon: Calendar },
    { href: '/collector/jobs', label: 'Collector', icon: Truck },
    { href: '/dashboard', label: 'Admin Ops', icon: Activity },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--line)] px-2 py-2 safe-area-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-mono transition-colors',
                isActive
                  ? 'text-[#173E2C] font-semibold'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                  isActive ? 'bg-[#E9EFE6] text-[#173E2C]' : 'text-[var(--muted)]'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
