'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { pickupPrice, pickupWindows, wasteCategories } from '@/lib/pickup-policy';
import { ResolveGridAddressResult, WasteCategory } from '@/lib/types';
import { useDemoMode } from '@/components/demo-mode';
import { AddressResolver } from '@/components/address-resolver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Minus, ArrowRight, CheckCircle } from 'lucide-react';

export default function CustomerBookPage() {
  const router = useRouter();
  const demo = useDemoMode();
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [resolvedRecord, setResolvedRecord] = React.useState<ResolveGridAddressResult | null>(null);

  const [categories, setCategories] = React.useState<WasteCategory[]>(['mixed']);
  const [bags, setBags] = React.useState(4);
  const [pickupWindow, setPickupWindow] = React.useState('Morning (08:00 - 11:00)');
  const [loading, setLoading] = React.useState(false);
  const [bookingError, setBookingError] = React.useState('');
  const pendingRequest = React.useRef<{ body: string; id: string } | null>(null);

  const { priceNgn: basePrice, recyclableCreditNgn: recyclableCredit } = pickupPrice(bags, categories);
  const netPrice = basePrice - recyclableCredit;

  const toggleCategory = (cat: WasteCategory) => {
    if (categories.includes(cat)) {
      if (categories.length > 1) {
        setCategories(categories.filter(c => c !== cat));
      }
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedRecord || loading) return;

    setLoading(true);
    setBookingError('');
    try {
      const body = JSON.stringify({
        customerPhone,
        rawAddressInput: resolvedRecord.rawInput,
        confirmedPostcode: resolvedRecord.digitalPostcode ?? resolvedRecord.postcode,
        position: ['RESIDENT_DEVICE_REVERSE_MATCH', 'PILOT_RESIDENT_PIN'].includes(resolvedRecord.coordinateOrigin ?? '') && resolvedRecord.coordinates
          ? { lat: resolvedRecord.coordinates.lat, lng: resolvedRecord.coordinates.lng } : undefined,
        wasteCategories: categories,
        estimatedBags: bags,
        pickupWindow,
      });
      if (pendingRequest.current?.body !== body) pendingRequest.current = { body, id: crypto.randomUUID() };
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': pendingRequest.current.id },
        body,
      });

      const data = await res.json();
      if (!res.ok || !data.job?.id) {
        throw new Error(data.error || 'Could not book the pickup. Try again.');
      }
      router.push(`/track/${data.job.id}`);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Could not book the pickup. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page Title */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Resident workspace</p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">Book a waste pickup</h1>
        <p className="text-sm text-[var(--muted)]">Choose the pickup location, tell us what to collect and pick a time window.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Address, Waste details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">1. Pickup location</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressResolver onResolved={setResolvedRecord} />
              {!demo && <label className="block border-t border-[var(--line)] pt-4 text-sm font-medium">
                Phone for your assigned collector (optional)
                <input type="tel" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} maxLength={23}
                  autoComplete="tel" placeholder="+234…" className="mt-1 block w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5" />
              </label>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--ink)]">
                2. Waste and pickup time
              </h2>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Waste categories multi-select */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-2">
                  Waste type
                </label>
                <p className="mb-3 text-sm text-[var(--muted)]">Trashify does not accept medical or chemical waste.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {wasteCategories.map((cat) => {
                    const isSelected = categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        aria-pressed={isSelected}
                        className={`p-3 rounded-md border text-left capitalize text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#41357e] bg-[#ece8fb] text-[#41357e] font-semibold'
                            : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--surface-3)]'
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#41357e]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bag Counter */}
              <div className="flex items-center justify-between p-4 rounded-md bg-[var(--surface-2)] border border-[var(--line)]">
                <div>
                  <span className="text-sm font-semibold text-[var(--ink)] block">
                    Estimated bags
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    Standard 50L refuse bags (~{bags * 6}kg total)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Remove one bag"
                    onClick={() => setBags(Math.max(1, bags - 1))}
                    className="w-9 h-9 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center hover:bg-[var(--surface-3)] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold w-6 text-center">
                    {bags}
                  </span>
                  <button
                    type="button"
                    aria-label="Add one bag"
                    disabled={bags >= 100}
                    onClick={() => setBags(Math.min(100, bags + 1))}
                    className="w-9 h-9 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center hover:bg-[var(--surface-3)] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Time Window */}
              <div>
                <p className="mb-2 text-sm text-[var(--muted)]">Pickup window · next available day in Abuja</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {pickupWindows.map(({ value: win }) => (
                    <button
                      key={win}
                      type="button"
                      onClick={() => setPickupWindow(win)}
                      aria-pressed={pickupWindow === win}
                      className={`p-2.5 rounded-lg border text-xs transition-all text-center ${
                        pickupWindow === win
                          ? 'border-[#41357e] bg-[#41357e] text-[#f7f5f1] font-medium'
                          : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--surface-3)]'
                      }`}
                    >
                      {win}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Summary, Price Breakdown, Dispatch factors */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#41357e] font-semibold">
                  Pickup summary
                </span>
                <span className="text-xs text-[#41357e]">Estimate</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Pickup fee ({bags} bags)</span>
                  <span className="text-[var(--ink)]">₦{basePrice.toLocaleString()}</span>
                </div>
                {recyclableCredit > 0 && (
                  <div className="flex justify-between text-[#41357e] font-medium">
                    <span className="flex items-center gap-1">
                      Recycling credit
                    </span>
                    <span className="font-mono">-₦{recyclableCredit.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#ddd7e4] flex justify-between items-baseline">
                  <span className="text-base font-bold text-[var(--ink)]">Estimated total</span>
                  <span className="text-2xl font-bold text-[#41357e]">
                    ₦{netPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3.5 text-base"
                  disabled={loading || !resolvedRecord}
                >
                  {loading ? (
                    <span>Booking pickup…</span>
                  ) : (
                    <>
                      <span>Book pickup</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                {!resolvedRecord && <p className="text-xs text-[var(--muted)]">Confirm a pickup location to continue.</p>}
                {bookingError && <p role="alert" className="text-sm text-[var(--red-tx)]">{bookingError}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
