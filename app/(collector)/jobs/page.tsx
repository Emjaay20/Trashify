'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PickupJob } from '@/lib/types';
import { CollectorJobCard } from '@/components/collector-job-card';
import { Truck, RefreshCw } from 'lucide-react';

export default function CollectorJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = React.useState<PickupJob[]>([]);
  const [selectedZone, setSelectedZone] = React.useState<string>('all');
  const [loading, setLoading] = React.useState(true);
  const [available, setAvailable] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const fetchJobs = React.useCallback(async () => {
    try {
      const [response, availability] = await Promise.all([fetch('/api/jobs'), fetch('/api/collectors')]);
      if (!response.ok || !availability.ok) throw new Error('Could not load your assigned pickups.');
      setJobs((await response.json()).jobs);
      setAvailable((await availability.json()).available);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not load the queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const initialLoad = setTimeout(fetchJobs, 0);
    return () => clearTimeout(initialLoad);
  }, [fetchJobs]);

  async function handleAcceptJob(jobId: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, { method: 'PATCH' });
      if (!response.ok) throw new Error((await response.json()).error);
      router.push(`/active/${jobId}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not start the pickup.');
      setBusy(false);
    }
  }

  async function toggleAvailability() {
    setBusy(true);
    try {
      const response = await fetch('/api/collectors', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !available }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      await fetchJobs();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not change availability.');
    } finally {
      setBusy(false);
    }
  }

  const zones = [...new Set(jobs.map((job) => job.postcodeRecord.postcode))];
  const filteredJobs = jobs.filter((job) => selectedZone === 'all' || job.postcodeRecord.postcode === selectedZone);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-5 py-8">
      <header className="border-b border-[var(--line)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Collector workspace</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">Pickup queue</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Start an assigned pickup and confirm collection at the address.</p>
      </header>
      {error && <p role="alert" className="text-sm text-[var(--red-tx)]">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
        <p className="text-sm font-medium">{available ? 'Available for new pickups' : 'Unavailable for new pickups'}</p>
        <button type="button" onClick={() => void toggleAvailability()} disabled={busy || loading}
          className="rounded-md border border-[var(--line-2)] px-3 py-2 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--surface-2)] disabled:opacity-50">
          {available ? 'Go unavailable' : 'Go available'}
        </button>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="flex items-center gap-3 text-sm font-medium">
          Service district
          <select value={selectedZone} onChange={(event) => setSelectedZone(event.target.value)}
            className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">
            <option value="all">All assigned</option>
            {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </select>
        </label>
        <button type="button" onClick={fetchJobs} className="inline-flex items-center gap-2 py-2 text-sm font-medium hover:underline">
          <RefreshCw size={16} aria-hidden /> Refresh queue
        </button>
      </div>
      {loading ? (
        <p role="status" className="text-sm text-[var(--muted)]">Loading pickups…</p>
      ) : filteredJobs.length === 0 ? (
        <div className="space-y-2 border-y border-[var(--line)] py-10 text-center">
          <Truck size={24} className="mx-auto text-[var(--muted)]" aria-hidden />
          <p className="text-sm">No pickups in this zone.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredJobs.map((job) => <CollectorJobCard key={job.id} job={job} onAccept={handleAcceptJob} busy={busy} />)}
        </div>
      )}
    </div>
  );
}
