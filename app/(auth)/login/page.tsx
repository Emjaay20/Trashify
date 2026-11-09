'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, User, Truck, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<'customer' | 'collector' | 'admin'>('customer');
  const [identifier, setIdentifier] = React.useState('+234 809 555 0192');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'customer') {
      router.push('/book');
    } else if (role === 'collector') {
      router.push('/collector/jobs');
    } else {
      router.push('/dashboard');
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
              Welcome to Trashify
            </h1>
            <p className="text-xs text-[var(--muted)]">
              Log into your unified Nigeria Postcode waste collection account
            </p>
          </div>

          {/* Role selector tabs */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] mb-2">
              Select Your Portal Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('customer');
                  setIdentifier('+234 809 555 0192');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  role === 'customer'
                    ? 'border-[#173E2C] bg-[#E9EFE6] text-[#173E2C] font-semibold'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--surface-3)]'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-xs">Resident</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('collector');
                  setIdentifier('+234 803 123 4567');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  role === 'collector'
                    ? 'border-[#173E2C] bg-[#E9EFE6] text-[#173E2C] font-semibold'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--surface-3)]'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span className="text-xs">Collector</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setIdentifier('admin@amac.gov.ng');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  role === 'admin'
                    ? 'border-[#173E2C] bg-[#E9EFE6] text-[#173E2C] font-semibold'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--surface-3)]'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="text-xs">AMAC Ops</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-1">
                {role === 'admin' ? 'Official Agency Email' : 'Nigerian Mobile Number (+234)'}
              </label>
              <input
                type={role === 'admin' ? 'email' : 'tel'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-sm focus:outline-none focus:border-[#173E2C]"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full py-3">
              <span>Continue to {role === 'customer' ? 'Resident Portal' : role === 'collector' ? 'Collector Driver Board' : 'AMAC Ops Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center text-xs text-[var(--muted)]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#173E2C] font-semibold underline underline-offset-2">
              Create one now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
