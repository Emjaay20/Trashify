'use client';

import * as React from 'react';
import { ResolveGridAddressResult } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Search, CheckCircle2, AlertTriangle, Sparkles, Navigation, Check } from 'lucide-react';

interface AddressResolverProps {
  initialValue?: string;
  onResolved: (result: ResolveGridAddressResult) => void;
  className?: string;
}

const PRESET_LANDMARKS = [
  'Yellow duplex near Banex, Wuse 2',
  'Behind Farmers Market, Maitama',
  'Federal Secretariat Junction, Garki',
  'Close to ECOWAS, Asokoro',
  'Alex Ekwueme Way near Jabi Lake Mall',
];

export function AddressResolver({ initialValue = '', onResolved, className }: AddressResolverProps) {
  const [query, setQuery] = React.useState(initialValue);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ResolveGridAddressResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmed, setConfirmed] = React.useState(false);

  const handleResolve = React.useCallback(async (textToResolve: string) => {
    if (!textToResolve.trim()) return;
    setLoading(true);
    setError(null);
    setConfirmed(false);

    try {
      const res = await fetch(`/api/resolve?q=${encodeURIComponent(textToResolve)}`);
      if (!res.ok) {
        throw new Error(`Resolution error (${res.status})`);
      }
      const data: ResolveGridAddressResult = await res.json();
      setResult(data);
      setConfirmed(!data.needsConfirmation);
      onResolved(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to ResolveGrid';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [onResolved]);

  // Initial resolve if initialValue provided
  React.useEffect(() => {
    if (initialValue && !result) {
      handleResolve(initialValue);
    }
  }, [initialValue, handleResolve, result]);

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div>
        <label className="block text-xs uppercase tracking-wider font-mono text-[var(--muted)] mb-2">
          Pickup Landmark or Informal Address (ResolveGrid × NIPOST)
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleResolve(query))}
            placeholder="e.g. Yellow duplex near Banex, Wuse 2"
            className="w-full pl-10 pr-24 py-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl text-sm focus:outline-none focus:border-[#173E2C] transition-colors shadow-inner"
          />
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleResolve(query)}
            disabled={loading || !query.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2"
          >
            {loading ? (
              <span className="animate-spin text-xs">●</span>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Resolve</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preset pills for quick testing */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-[var(--muted)] font-mono flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#9A7E4A]" /> Quick Fill:
        </span>
        {PRESET_LANDMARKS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setQuery(preset);
              handleResolve(preset);
            }}
            className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--ink-2)] border border-[var(--line)] transition-colors"
          >
            {preset.split(',')[0]}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-[#FDECEC] border border-[#FCD5D5] rounded-lg text-xs text-[#7A1F1F] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Resolved Result Card */}
      {result && (
        <div className="p-4 rounded-xl border border-[#D6D0BE] bg-[#FAF8F3] space-y-3 shadow-sm transition-all animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-semibold text-[#173E2C] flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-[#173E2C]" /> Postcode {result.postcode}
                </span>
                <Badge variant={result.source === 'NIPOST_OFFICIAL_API' ? 'forest' : 'brass'} size="sm">
                  {result.source === 'NIPOST_OFFICIAL_API' ? 'NIPOST Official' : 'ResolveGrid'}
                </Badge>
                {result.coordinates?.tierLevel && (
                  <Badge variant="neutral" size="sm">
                    Tier {result.coordinates.tierLevel}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-[var(--ink)] leading-snug">
                {result.standardizedAddress}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {result.area}, {result.lga}, {result.state}
                {result.landmarkMatch && ` • Ref: ${result.landmarkMatch}`}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-xs font-semibold text-[#173E2C]">
                {Math.round(result.confidence * 100)}%
              </span>
              <p className="text-[10px] text-[var(--muted)] font-mono">confidence</p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E3DED0] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[var(--muted)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#173E2C]" />
              <span>Standardized geometry ready for collector route</span>
            </div>
            {result.needsConfirmation && !confirmed ? (
              <button
                type="button"
                onClick={() => setConfirmed(true)}
                className="px-2.5 py-1 bg-[#FEF6E0] text-[#7A5A12] border border-[#F2EAD3] rounded-md font-mono text-[11px] hover:bg-[#FCEAC2] transition-colors"
              >
                Confirm Address
              </button>
            ) : (
              <span className="font-mono text-[11px] text-[#173E2C] flex items-center gap-1 font-medium">
                <Check className="w-3 h-3" /> Verified Zone
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
