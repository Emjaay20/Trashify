'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const field = 'mt-1 block w-full rounded-md border border-[var(--line-2)] bg-[var(--surface)] px-3 py-2.5';

export default function ResetPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, action: 'reset' }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      // Reset invalidates the session and its cached workspace across the document.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not reset the password.');
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-5 px-5 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Reset your password</h1>
      <p className="text-sm text-[var(--muted)]">Ask your Trashify operator for a reset code. It expires after 30 minutes and can be used once.</p>
      <form onSubmit={submit} className="space-y-4 rounded-md border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <label className="block text-sm font-medium">Email address
          <input className={field} type="email" name="email" autoComplete="email" required maxLength={254} />
        </label>
        <label className="block text-sm font-medium">Reset code
          <input className={field} name="token" autoComplete="off" required maxLength={32} />
        </label>
        <label className="block text-sm font-medium">New password
          <input className={field} type="password" name="password" autoComplete="new-password" required minLength={12} maxLength={128} />
        </label>
        {error && <p role="alert" className="text-sm text-[var(--red-tx)]">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Reset password'}</Button>
        <Link href="/login" className="ml-4 text-sm underline">Back to sign-in</Link>
      </form>
    </section>
  );
}
