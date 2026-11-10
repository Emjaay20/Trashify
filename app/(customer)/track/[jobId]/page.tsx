'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { JobStatus, PickupJob } from '@/lib/types';
import { PickupReports } from '@/components/pickup-reports';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const pickupStatus: Record<JobStatus, string> = {
  requested: 'Awaiting a collector',
  address_verified: 'Location confirmed',
  collector_matched: 'Collector assigned',
  collector_en_route: 'Collector en route',
  at_location: 'Collector has arrived',
  verified_completed: 'Waste collected',
  paid: 'Waste collected',
};

function CustomerTrackContent() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<(PickupJob & { canReportMissed: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);

  const fetchJob = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, { signal, cache: 'no-store' });
      if (response.status === 404) {
        setJob(null);
        return;
      }
      if (!response.ok) throw new Error('Could not load pickup.');
      const data = await response.json();
      setJob(data.job);
      setStale(false);
    } catch {
      if (!signal?.aborted) setStale(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    const request = new AbortController();
    const refresh = () => void fetchJob(request.signal);
    refresh();
    const timer = setInterval(refresh, 4000);
    return () => {
      request.abort();
      clearInterval(timer);
    };
  }, [fetchJob]);

  if (!job) {
    return (
      <p role="status" className="mx-auto max-w-3xl px-5 py-12">
        {loading ? 'Loading pickup…' : 'Pickup unavailable. Check the link and try again.'}
      </p>
    );
  }

  const completed = job.status === 'verified_completed' || job.status === 'paid';

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/book" className="inline-flex items-center gap-2 hover:underline"><ArrowLeft size={16} aria-hidden /> Book another pickup</Link>
        <button type="button" onClick={() => void fetchJob()} className="inline-flex items-center gap-2 hover:underline">
          <RefreshCw size={16} aria-hidden /> Refresh status
        </button>
      </div>

      <header className="border-b border-[var(--line)] pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Pickup · {job.id.slice(4, 12).toUpperCase()}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{completed ? 'Waste collected' : 'Pickup details'}</h1>
        {!completed && <p className="mt-3 font-medium text-[var(--accent)]">{pickupStatus[job.status]}</p>}
        {stale && <p role="status" className="mt-3 text-sm text-[var(--muted)]">Couldn’t refresh. Showing the last known status.</p>}
      </header>

      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-[var(--muted)]">Pickup address</dt>
          <dd className="mt-1">{job.postcodeRecord.standardizedAddress}</dd>
          <dd className="mt-1 text-sm text-[var(--muted)]">{job.postcodeRecord.digitalPostcode ?? job.postcodeRecord.postcode}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-[var(--muted)]">Pickup window</dt>
          <dd className="mt-1">{job.scheduledDate} · {job.pickupWindow}</dd>
          <dd className="mt-1 text-sm text-[var(--muted)]">{job.estimatedBags} bags · {job.wasteCategories.join(', ')}</dd>
        </div>
      </dl>

      {!completed && (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Pickup PIN</h2></CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold tabular-nums tracking-[0.15em]">{job.verification?.confirmationCode ?? '—'}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Share this PIN with your collector after they load the bags.</p>
          </CardContent>
        </Card>
      )}

      {job.collector && (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Assigned collector</h2></CardHeader>
          <CardContent>
            <p className="font-medium">{job.collector.name}</p>
            <p className="text-sm text-[var(--muted)]">{job.collector.vehicle}</p>
          </CardContent>
        </Card>
      )}

      <PickupReports jobId={job.id} canReportMissed={job.canReportMissed} />

      {completed && (
        <p className="flex items-center gap-2 border-l-2 border-[var(--accent)] bg-[var(--surface-2)] px-4 py-3 text-sm font-medium">
          <Check size={18} aria-hidden /> Collection recorded in Trashify.
        </p>
      )}
    </div>
  );
}

export default function CustomerTrackPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-3xl px-5 py-12">Loading pickup…</p>}>
      <CustomerTrackContent />
    </Suspense>
  );
}
