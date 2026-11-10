'use client';

import { useId, useState } from 'react';
import { samplePostcode } from '@/lib/demo-sample';
import { useDemoMode } from '@/components/demo-mode';
import type { PickupPosition } from '@/lib/pickup-policy';
import { ResolveGridAddressResult } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface AddressResolverProps {
  onResolved: (result: ResolveGridAddressResult | null) => void;
}

export function AddressResolver({ onResolved }: AddressResolverProps) {
  const inputId = useId();
  const demo = useDemoMode();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResolveGridAddressResult | null>(null);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  async function lookup(address: string, useLocation = false) {
    if (!address.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setConfirmed(false);
    setError('');
    onResolved(null);

    try {
      let position: PickupPosition | undefined;
      if (useLocation) {
        if (!navigator.geolocation) throw new Error('Device location is unavailable.');
        const { coords } = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, () => reject(
            new Error('Allow location access and try again from the pickup spot.')
          ), { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 });
        });
        if (coords.accuracy > 50) throw new Error('Move to the pickup spot and try again for a more accurate location.');
        position = { lat: coords.latitude, lng: coords.longitude };
      }
      const response = await fetch('/api/resolve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: address.trim(), position }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not look up the pickup location.');
      setResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not look up the pickup location.');
    } finally {
      setLoading(false);
    }
  }

  const exactCode = /^[A-Z]{2}\d{2}[A-Z]\d{2}[A-Z]{2}\d{2}$/.test(query.toUpperCase().replace(/[ -]/g, ''));
  const source = result?.source === 'NIPOST_OFFICIAL_API'
    ? 'NIPOST live lookup'
    : result?.source === 'NIPOST_SANDBOX' ? 'NIPOST sandbox' : 'Sample address';

  return (
    <div className="space-y-3">
      <label htmlFor={inputId} className="block text-sm font-medium">Building postcode or nearby landmark</label>
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <input
          id={inputId}
          value={query}
          disabled={loading}
          maxLength={300}
          placeholder="e.g. Yellow duplex near Banex, Wuse 2"
          className="min-w-0 flex-1 basis-full rounded-md border border-[var(--line-2)] bg-[var(--surface)] px-3 py-2.5 text-sm sm:basis-auto"
          onChange={(event) => {
            setQuery(event.target.value);
            setResult(null);
            setError('');
            setConfirmed(false);
            onResolved(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void lookup(query);
            }
          }}
        />
        <Button type="button" variant="outline" onClick={() => void lookup(query)} disabled={loading || !query.trim()}>
          {loading ? 'Looking up…' : 'Find location'}
        </Button>
      </div>
      {demo && !result && (
        <Button type="button" variant="ghost" disabled={loading} onClick={() => {
          setQuery(samplePostcode);
          void lookup(samplePostcode);
        }}>Use sample postcode</Button>
      )}
      {!demo && exactCode && !result && (
        <Button type="button" variant="ghost" disabled={loading} onClick={() => void lookup(query, true)}>
          Verify postcode at my location
        </Button>
      )}
      {error && <p role="alert" className="text-sm text-[var(--red-tx)]">{error}</p>}
      {result && (
        <div className="space-y-3 border-l-2 border-[var(--accent)] bg-[var(--surface-2)] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{source}</p>
            <p className="mt-1 font-semibold">{result.standardizedAddress}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {result.digitalPostcode ? `Building ${result.digitalPostcode} · ` : ''}Service district {result.postcode}
            </p>
            {result.coordinateOrigin === 'RESIDENT_DEVICE_REVERSE_MATCH' && (
              <p className="mt-2 text-sm text-[var(--muted)]">NIPOST matched your device location to this building code.</p>
            )}
            {result.source === 'RESOLVEGRID_FIXTURE' && (
              <p className="mt-2 text-sm text-[var(--muted)]">Use this location for a demo pickup.</p>
            )}
          </div>
          {confirmed ? (
            <p role="status" className="text-sm font-semibold text-[var(--accent)]">Pickup location confirmed</p>
          ) : (
            <Button type="button" size="sm" onClick={() => {
              setConfirmed(true);
              onResolved(result);
            }}>Use this location</Button>
          )}
        </div>
      )}
    </div>
  );
}
