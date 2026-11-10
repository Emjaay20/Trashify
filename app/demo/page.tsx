import { Suspense } from 'react';
import Link from 'next/link';
import { currentAccount } from '@/lib/auth';
import { samplePin } from '@/lib/demo-sample';
import { DemoWorkspaces } from '@/components/demo-workspaces';

async function WorkspaceChoices() {
  const account = await currentAccount();
  if (account && !account.demoGroup) {
    return <p className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-5">Use <strong>Sign out</strong> at the top to open a private demo from this browser.</p>;
  }
  return <DemoWorkspaces current={account?.role} />;
}

export default function DemoPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-7 px-5 py-12 sm:py-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Interactive demo</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Try Trashify in four roles</h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">Start anywhere. Sample bookings and reports follow you when you switch workspaces. Your private demo lasts two hours.</p>
      </header>
      <Suspense fallback={<p>Loading demo workspaces…</p>}><WorkspaceChoices /></Suspense>
      <section className="space-y-2 border-y border-[var(--line)] py-5 text-sm">
        <h2 className="font-semibold">Try a complete pickup</h2>
        <p className="text-[var(--muted)]">Open the collector workspace and choose a sample pickup. Use PIN <strong>{samplePin}</strong> for a preloaded job. If you book a new pickup, copy its PIN from resident tracking. Then return to the resident workspace to see the completed pickup.</p>
      </section>
      <Link href="/register" className="text-sm font-semibold text-[var(--accent)] underline underline-offset-4">Create your own account</Link>
    </section>
  );
}
