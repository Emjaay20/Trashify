'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ResolveGridAddressResult, WasteCategory } from '@/lib/types';
import { AddressResolver } from '@/components/address-resolver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles, Clock, CheckCircle } from 'lucide-react';

export default function CustomerBookPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = React.useState('Adaeze Okonkwo');
  const [customerPhone, setCustomerPhone] = React.useState('+234 809 555 0192');
  const [estateName, setEstateName] = React.useState('Sunrise Estate');
  const [addressInput, setAddressInput] = React.useState('Yellow duplex near Banex, Wuse 2');
  const [resolvedRecord, setResolvedRecord] = React.useState<ResolveGridAddressResult | null>(null);

  const [categories, setCategories] = React.useState<WasteCategory[]>(['mixed', 'plastics']);
  const [bags, setBags] = React.useState(4);
  const [pickupWindow, setPickupWindow] = React.useState('Morning (08:00 - 11:00)');
  const [loading, setLoading] = React.useState(false);

  // Price Calculation
  const basePrice = 3000 + (bags - 1) * 500;
  const hasRecyclables = categories.some(c => ['plastics', 'paper', 'metal'].includes(c));
  const recyclableCredit = hasRecyclables ? 200 * Math.min(bags, 3) : 0;
  const netPrice = Math.max(2500, basePrice - recyclableCredit);

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
    if (!addressInput) return;

    setLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          estateName,
          rawAddressInput: addressInput,
          wasteCategories: categories,
          estimatedBags: bags,
          scheduledDate: 'Today, On-Demand',
          pickupWindow
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create pickup booking');
      }

      const data = await res.json();
      if (data.job?.id) {
        router.push(`/customer/track/${data.job.id}`);
      } else {
        router.push('/customer/track/TRF-1042');
      }
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="forest">Resident Portal</Badge>
          <span className="text-xs font-mono text-[var(--muted)]">Step 1: On-Demand Pickup</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--ink)]">
          Schedule Waste Pickup
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Standardized with ResolveGrid and matched instantly to licensed municipal collectors in your NIPOST zone.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Address, Waste details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-serif text-lg font-semibold text-[var(--ink)] flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-[#173E2C]" />
                <span>1. Location & ResolveGrid Landmark</span>
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddressResolver
                initialValue={addressInput}
                onResolved={(res) => {
                  setResolvedRecord(res);
                  setAddressInput(res.rawInput);
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-mono text-[var(--muted)] mb-1">
                    Estate / Compound Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={estateName}
                    onChange={(e) => setEstateName(e.target.value)}
                    placeholder="e.g. Sunrise Estate"
                    className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:border-[#173E2C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[var(--muted)] mb-1">
                    Customer Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:border-[#173E2C]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">
                2. Waste Categories & Bag Estimate
              </h2>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Waste categories multi-select */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--muted)] mb-2">
                  Waste Stream Categories
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['mixed', 'plastics', 'paper', 'metal', 'e-waste', 'organic'] as WasteCategory[]).map((cat) => {
                    const isSelected = categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`p-3 rounded-xl border text-left capitalize text-xs font-mono transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#173E2C] bg-[#E9EFE6] text-[#173E2C] font-semibold'
                            : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--surface-3)]'
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#173E2C]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bag Counter */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                <div>
                  <span className="text-sm font-semibold text-[var(--ink)] block">
                    Estimated Bag Count
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    Standard 50L refuse bags (~{bags * 6}kg total)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBags(Math.max(1, bags - 1))}
                    className="w-9 h-9 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center hover:bg-[var(--surface-3)] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-lg font-bold w-6 text-center">
                    {bags}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBags(bags + 1)}
                    className="w-9 h-9 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center hover:bg-[var(--surface-3)] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Time Window */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--muted)] mb-2">
                  Preferred Pickup Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {['Morning (08:00 - 11:00)', 'Midday (11:30 - 14:00)', 'Afternoon (14:30 - 17:00)'].map((win) => (
                    <button
                      key={win}
                      type="button"
                      onClick={() => setPickupWindow(win)}
                      className={`p-2.5 rounded-lg border text-xs font-mono transition-all text-center ${
                        pickupWindow === win
                          ? 'border-[#173E2C] bg-[#173E2C] text-[#FAF8F3] font-medium'
                          : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--surface-3)]'
                      }`}
                    >
                      {win.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Summary, Price Breakdown, Dispatch factors */}
        <div className="space-y-6">
          <Card className="sticky top-20 border-2 border-[#173E2C]/20 bg-[#FAF8F3]">
            <CardHeader className="bg-[#E9EFE6] rounded-t-xl border-b border-[#D6D0BE]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#173E2C] font-semibold">
                  Pickup Summary
                </span>
                <span className="font-mono text-xs text-[#173E2C]">Live Quote</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Base Pickup Fee ({bags} bags)</span>
                  <span className="font-mono text-[var(--ink)]">₦{basePrice.toLocaleString()}</span>
                </div>
                {recyclableCredit > 0 && (
                  <div className="flex justify-between text-[#173E2C] font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#9A7E4A]" /> Recyclables Incentive
                    </span>
                    <span className="font-mono">-₦{recyclableCredit.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E3DED0] flex justify-between items-baseline">
                  <span className="font-serif text-base font-bold text-[var(--ink)]">Total Amount</span>
                  <span className="font-serif text-2xl font-bold text-[#173E2C]">
                    ₦{netPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Explainable Dispatch Preview */}
              <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
                  Explainable Dispatch Preview
                </span>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1 text-[var(--ink-2)]">
                    <Clock className="w-3.5 h-3.5 text-[#173E2C]" /> Est. Arrival Time
                  </span>
                  <span className="font-bold text-[#173E2C]">~16 mins</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Calculated using 3.2km route distance in Postcode {resolvedRecord?.postcode || '900211'} + morning municipal traffic index (1.35x).
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3.5 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span>Dispatching Collector...</span>
                  ) : (
                    <>
                      <span>Confirm & Match Driver</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--muted)] font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#173E2C]" />
                  <span>Verified 4-Digit Handshake PIN Issued</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
