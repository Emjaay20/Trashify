import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { currentAccount } from '@/lib/auth';
import { workspaces } from '@/lib/roles';

async function ApprovalStatus() {
  const account = await currentAccount();
  if (!account) redirect('/login');
  if (account.active) redirect(workspaces[account.role].path);
  return (
    <section className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{account.role === 'collector' ? 'Collector approval pending' : 'Account access paused'}</h1>
      <p className="mt-4 text-[var(--muted)]">
        {account.role === 'collector'
          ? 'Your workspace opens once the operator verifies your licence and service zones. Refresh this page after you receive confirmation.'
          : 'Contact your Trashify operator to review access.'}
      </p>
    </section>
  );
}

export default function Page() {
  return <Suspense fallback={<p className="p-6">Checking your account…</p>}><ApprovalStatus /></Suspense>;
}
