'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { workspaces, type Role } from '@/lib/roles';

type Viewer = { role: Role; active: boolean; demo: boolean };

export function Navbar({ viewer }: { viewer: Viewer | null }) {
  const pathname = usePathname();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const workspace = viewer && workspaces[viewer.role];
  const destination = viewer?.active ? workspace?.path : '/pending';

  async function logout() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      if (!response.ok) throw new Error('Sign-out failed.');
      // Start a new document after revoking the authenticated session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/');
    } catch {
      setError('Couldn’t sign out. Try again.');
      setBusy(false);
    }
  }

  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-2 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
          <span className="grid size-8 place-items-center rounded-sm bg-[var(--action)] text-white">
            <Trash2 size={17} aria-hidden />
          </span>
          Trashify
        </Link>
        <nav aria-label="Account" className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm font-semibold">
          {viewer && workspace && destination ? (
            <>
              <Link href={destination} aria-current={pathname === destination ? 'page' : undefined} className="hover:underline">
                {viewer.active ? workspace.label + ' workspace' : 'Account status'}
              </Link>
              <button type="button" onClick={logout} disabled={busy} className="py-2 text-[var(--accent)] hover:underline disabled:opacity-60">
                {busy ? 'Signing out…' : viewer.demo ? 'Exit demo' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <Link href="/demo" className="py-2 text-[var(--accent)] hover:underline">Try demo</Link>
              <Link href="/login" className="py-2 hover:underline">Sign in</Link>
              <Link href="/register" className="rounded-md border border-[var(--line-2)] px-3 py-2 hover:bg-[var(--surface-2)]">Sign up</Link>
            </>
          )}
        </nav>
        {error && <p role="alert" className="w-full text-right text-sm text-[var(--red-tx)]">{error}</p>}
      </div>
      {viewer?.demo && (
        <div className="border-t border-[var(--line)] bg-[var(--accent-soft)] px-5 py-2 text-sm">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-x-4 gap-y-1 sm:px-3">
            <span><strong>Demo mode</strong> · Sample data</span>
            <Link href="/demo" className="font-semibold text-[var(--accent)] underline underline-offset-4">Switch demo workspace</Link>
          </div>
        </div>
      )}
    </header>
  );
}
