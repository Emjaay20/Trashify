'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<'customer' | 'collector'>('customer');
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [postcode, setPostcode] = React.useState('900211');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'customer') {
      router.push('/book');
    } else {
      router.push('/collector/jobs');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-[var(--line)] shadow-lg bg-[var(--surface)]">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#173E2C] text-[#FAF8F3] mx-auto flex items-center justify-center shadow-md">
              <Trash2 className="w-6 h-6 text-[#FAF8F3]" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">
              Join Trashify
            </h1>
            <p className="text-xs text-[var(--muted)]">
              Register as a resident or licensed municipal waste collector
            </p>
          </div>

          <div className="flex rounded-xl bg-[var(--surface-2)] p-1 border border-[var(--line)]">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg transition-all ${
                role === 'customer'
                  ? 'bg-[#173E2C] text-[#FAF8F3] shadow-xs'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              Resident / Business
            </button>
            <button
              type="button"
              onClick={() => setRole('collector')}
              className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg transition-all ${
                role === 'collector'
                  ? 'bg-[#173E2C] text-[#FAF8F3] shadow-xs'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              Collector Driver
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-1">
                Full Name / Estate Contact
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Adaeze Okonkwo"
                required
                className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-sm focus:outline-none focus:border-[#173E2C]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-1">
                Nigerian Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                required
                className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-sm focus:outline-none focus:border-[#173E2C]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-1">
                Primary NIPOST Postcode Zone
              </label>
              <select
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-sm focus:outline-none focus:border-[#173E2C]"
              >
                <option value="900211">900211 — Wuse 2 (AMAC)</option>
                <option value="900271">900271 — Maitama (AMAC)</option>
                <option value="900001">900001 — Garki 1 (AMAC)</option>
                <option value="900231">900231 — Asokoro (AMAC)</option>
                <option value="900108">900108 — Jabi Lake (AMAC)</option>
                <option value="900104">900104 — Gwarinpa (AMAC)</option>
              </select>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3">
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center text-xs text-[var(--muted)]">
            Already registered?{' '}
            <Link href="/login" className="text-[#173E2C] font-semibold underline underline-offset-2">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
