'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { isRole, type Role, workspaces } from '@/lib/roles';
import { Button } from '@/components/ui/button';

const inputStyle = 'mt-1 block w-full rounded-md border border-[var(--line-2)] bg-[var(--surface)] px-3 py-2.5';

export function AccountForm({ mode }: { mode: 'login' | 'register' }) {
  const preselected = useSearchParams().get('role');
  const [role, setRole] = useState<Role>(isRole(preselected) ? preselected : 'resident');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const registering = mode === 'register';
  const needsInvite = role === 'estate' || role === 'municipal';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, action: mode, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.assign(data.path);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not reach Trashify.');
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-8 px-5 py-12 md:grid-cols-[0.95fr_1fr] md:gap-14 md:py-20">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Trashify accounts</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{registering ? 'Create your account' : 'Sign in to Trashify'}</h1>
        <fieldset className="mt-7 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          <legend className="mb-2 text-sm font-semibold">Choose your workspace</legend>
          {(Object.keys(workspaces) as Role[]).map((option) => (
            <label key={option} className="flex cursor-pointer items-start gap-3 py-3.5">
              <input type="radio" name="workspace" value={option} checked={role === option}
                onChange={() => { setRole(option); setError(''); }} disabled={busy} className="mt-1 accent-[var(--accent)]" />
              <span>
                <span className="block font-semibold">{workspaces[option].label}</span>
                <span className="block text-sm text-[var(--muted)]">{workspaces[option].description}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <h2 className="text-xl font-semibold">{workspaces[role].label} account</h2>
        {registering && role === 'collector' && <p className="text-sm text-[var(--muted)]">Your licence, operating zones and vehicle need approval before you can receive pickups.</p>}
        {registering && <label className="block text-sm font-medium">Full name
          <input className={inputStyle} name="name" autoComplete="name" required minLength={2} maxLength={100} />
        </label>}
        <label className="block text-sm font-medium">Email address
          <input className={inputStyle} type="email" name="email" autoComplete="email" required maxLength={254} />
        </label>
        <label className="block text-sm font-medium">Password
          <input className={inputStyle} type="password" name="password" aria-describedby={registering ? 'password-help' : undefined} autoComplete={registering ? 'new-password' : 'current-password'}
            required minLength={12} maxLength={128} />
        </label>
        {registering && <p id="password-help" className="text-xs text-[var(--muted)]">Use at least 12 characters.</p>}
        {registering && role !== 'collector' && <div><label className="block text-sm font-medium">
          {needsInvite ? 'Invitation code' : 'Estate invitation code (optional)'}
          <input className={inputStyle} name="invitation" aria-describedby="invitation-help" autoComplete="off" required={needsInvite} maxLength={100} />
        </label>
        <p id="invitation-help" className="mt-1 text-xs text-[var(--muted)]">
          {needsInvite ? 'Use the invitation issued for this email address.'
            : 'Joining an estate shares your pickup’s service district, status and sanitation report type with its managers.'}
        </p></div>}
        {!registering && <Link href="/demo" className="block text-sm text-[var(--accent)] underline underline-offset-4">Explore the demo without signing in</Link>}
        {!registering && <Link href="/reset" className="block text-sm text-[var(--accent)] underline underline-offset-4">Reset your password</Link>}
        {registering && <Link href="/privacy" className="block text-sm text-[var(--accent)] underline underline-offset-4">How Trashify uses your data</Link>}
        {error && <p role="alert" className="text-sm text-[var(--red-tx)]">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in'} <ArrowRight size={16} aria-hidden />
        </Button>
        <p className="text-sm text-[var(--muted)]">
          {registering ? 'Already have an account?' : 'New to Trashify?'}{' '}
          <Link href={`${registering ? '/login' : '/register'}?role=${role}`} className="font-semibold text-[var(--accent)] underline underline-offset-4">
            {registering ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </form>
    </section>
  );
}
