import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { requireWorkspace } from '@/lib/auth';
import { getJobs } from '@/lib/db';

async function Pickups() {
  const account = await requireWorkspace(['resident']);
  const jobs = getJobs(account);
  return (
    <section className="mx-auto max-w-4xl px-5 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Resident workspace</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Your pickups</h1>
        </div>
        <Link href="/book" className="inline-flex items-center gap-2 rounded-md bg-[var(--action)] px-4 py-2.5 text-sm font-semibold text-white">
          Book a pickup <ArrowRight size={16} aria-hidden />
        </Link>
      </header>
      {jobs.length === 0 ? (
        <p className="py-8 text-[var(--muted)]">Your booked pickups will appear here.</p>
      ) : (
        <div className="divide-y divide-[var(--line)]">
          {jobs.map((job) => (
            <Link key={job.id} href={`/track/${job.id}`} className="flex items-center justify-between gap-4 py-5 hover:text-[var(--accent)]">
              <div>
                <p className="font-semibold">{job.postcodeRecord.standardizedAddress}</p>
                <p className="text-sm text-[var(--muted)]">{job.scheduledDate} · {job.pickupWindow}</p>
              </div>
              <ArrowRight size={16} className="shrink-0" aria-hidden />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Page() {
  return <Suspense fallback={<p className="p-6">Loading pickups…</p>}><Pickups /></Suspense>;
}
