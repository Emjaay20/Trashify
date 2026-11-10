'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { PickupJob } from '@/lib/types';

function ActivePickup() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<(PickupJob & { demo: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const request = new AbortController();
    fetch(`/api/jobs/${encodeURIComponent(jobId)}`, { signal: request.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setJob((await response.json()).job);
      })
      .catch(() => {
        if (!request.signal.aborted) setError('Could not load this pickup.');
      })
      .finally(() => {
        if (!request.signal.aborted) setLoading(false);
      });
    return () => request.abort();
  }, [jobId]);

  async function complete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!job || busy) return;
    setBusy(true);
    setError('');
    try {
      let gpsLocation;
      if (!job.demo) {
        if (!navigator.geolocation) throw new Error('Location is unavailable on this device.');
        const { coords } = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, () => reject(
            new Error('Allow location access and try again from the pickup address.')
          ), { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 });
        });
        gpsLocation = { lat: coords.latitude, lng: coords.longitude, accuracyMeters: coords.accuracy };
      }
      const response = await fetch('/api/evidence', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId, customerConfirmationCode: pin,
          gpsLocation, simulateDemoLocation: job.demo,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setJob(data.job);
      setPin('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not complete this pickup.');
    } finally {
      setBusy(false);
    }
  }

  if (!job) return <p role="status" className="mx-auto max-w-3xl px-5 py-12">{loading ? 'Loading pickup…' : error}</p>;

  const completed = job.status === 'verified_completed' || job.status === 'paid';
  const { coordinates, standardizedAddress, digitalPostcode, postcode, landmarkMatch } = job.postcodeRecord;
  const mapQuery = coordinates ? `${coordinates.lat},${coordinates.lng}` : standardizedAddress;

  return (
    <section className="mx-auto max-w-3xl space-y-6 px-5 py-10">
      <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-medium hover:underline"><ArrowLeft size={16} aria-hidden /> Back to pickup queue</Link>
      <header className="border-b border-[var(--line)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Pickup · {job.id.slice(4, 12).toUpperCase()}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{completed ? 'Pickup complete' : 'Collection stop'}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{job.scheduledDate} · {job.pickupWindow}</p>
      </header>
      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Pickup location</h2></CardHeader>
        <CardContent className="space-y-3">
          <p className="font-medium">{standardizedAddress}</p>
          <p className="text-sm text-[var(--muted)]">{digitalPostcode ?? postcode} · {job.estimatedBags} bags · {job.wasteCategories.join(', ')}</p>
          {landmarkMatch && <p className="text-sm text-[var(--muted)]">{landmarkMatch}</p>}
          {!completed && !job.demo && (
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-[var(--accent)]">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 hover:underline">
                Open directions <ExternalLink size={14} aria-hidden />
              </a>
              {job.customerPhone && <a href={`tel:${job.customerPhone}`} className="hover:underline">Call resident</a>}
            </div>
          )}
        </CardContent>
      </Card>
      {!completed && (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Confirm collection</h2></CardHeader>
          <CardContent>
            {job.status === 'collector_matched' ? (
              <p className="text-sm">Start this pickup from the <Link href="/jobs" className="underline">pickup queue</Link> first.</p>
            ) : (
              <form onSubmit={complete} className="space-y-4">
                <p className="text-sm text-[var(--muted)]">{job.demo ? 'Demo mode simulates the pickup location. Use the PIN from resident tracking, or 4821 for a preloaded pickup.'
                  : 'After loading the bags, ask for the resident’s PIN. Trashify will request your current location to check you’re near the pickup.'}</p>
                <label className="block text-sm font-medium">Resident pickup PIN
                  <input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
                    inputMode="numeric" maxLength={4} autoComplete="off" required placeholder="0000"
                    className="mt-1 block w-36 rounded-md border border-[var(--line-2)] px-3 py-2 text-xl tabular-nums tracking-widest" />
                </label>
                {error && <p role="alert" className="text-sm text-[var(--red-tx)]">{error}</p>}
                <Button type="submit" disabled={busy || pin.length !== 4}>{busy ? 'Checking location and PIN…' : 'Complete pickup'}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}

export default function Page() {
  return <Suspense fallback={<p className="p-6">Loading pickup…</p>}><ActivePickup /></Suspense>;
}
