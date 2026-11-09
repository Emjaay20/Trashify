'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Trash2, Smartphone, Shield, Truck, UserCheck, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Overview', icon: Layers },
    { href: '/book', label: 'Book Pickup', icon: UserCheck },
    { href: '/collector/jobs', label: 'Collector Driver', icon: Truck },
    { href: '/dashboard', label: 'Municipal Ops', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--line)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#173E2C] text-[#FAF8F3] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Trash2 className="w-5 h-5 text-[#FAF8F3]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold tracking-tight text-[var(--ink)]">
                Trashify
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-[#E9EFE6] text-[#173E2C] border border-[#D6D0BE]">
                NG
              </span>
            </div>
            <p className="text-[10px] font-mono text-[var(--muted)] -mt-0.5 hidden sm:block">
              NIPOST Postcode × ResolveGrid Engine
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--line)]">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors font-mono',
                  isActive
                    ? 'bg-[#173E2C] text-[#FAF8F3] shadow-xs'
                    : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-3)]'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right actions: Live Postcode Zone pill & Mobile App Install */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#173E2C] animate-pulse" />
            <span className="text-[var(--ink-2)]">Abuja Central Zone</span>
            <span className="text-[var(--muted)]">#900211</span>
          </div>

          <Link
            href="/#mobile-app"
            className="flex items-center gap-1.5 text-xs font-mono font-medium px-3 py-1.5 rounded-lg border border-[#9A7E4A]/30 bg-[#FEF6E0] text-[#7A5A12] hover:bg-[#F2EAD3] transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile App / PWA</span>
            <span className="sm:hidden">App</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
