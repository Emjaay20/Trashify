'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Trash2, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  Navigation, 
  Layers, 
  Building2, 
  Clock, 
  ExternalLink,
  Download,
  Activity,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AddressResolver } from '@/components/address-resolver';
import { ResolveGridAddressResult } from '@/lib/types';

export default function HomePage() {
  const [activeTab, setActiveTab] = React.useState<'showcase' | 'demo' | 'resolvegrid' | 'mobile'>('showcase');
  const [demoStep, setDemoStep] = React.useState(0);
  const [resolvedRecord, setResolvedRecord] = React.useState<ResolveGridAddressResult | null>(null);

  const demoSteps = [
    {
      num: '01',
      title: 'Customer Books Pickup',
      heading: 'Resident Adaeze submits informal landmark',
      desc: 'Enters "Yellow duplex near Banex, Wuse 2" with 4 refuse bags. Upfront quote generated instantly.',
      postcode: '900211',
      status: 'Requested',
      role: 'Customer App'
    },
    {
      num: '02',
      title: 'ResolveGrid Standardizes Address',
      heading: 'NIPOST National Digital Postcode assigned',
      desc: 'ResolveGrid matches Banex landmark, returns 89% confidence, AMAC LGA, and Tier 4 geometry boundary.',
      postcode: '900211',
      status: 'Address Verified',
      role: 'ResolveGrid Engine'
    },
    {
      num: '03',
      title: 'Licensed Collector Matched',
      heading: 'Dispatched to Musa Ibrahim (AEPB Mini Truck)',
      desc: 'Rules-based allocation: Zone 900211 match, valid mixed waste license, 65% capacity load.',
      postcode: '900211',
      status: 'Collector En Route',
      role: 'Dispatch Engine'
    },
    {
      num: '04',
      title: 'Explainable ETA & Handshake PIN',
      heading: 'Customer receives 4-digit code (4821)',
      desc: 'Transparent arrival time calculated: 3.2km distance × 1.35 urban traffic + 1 prior stop = 18 mins.',
      postcode: '900211',
      status: 'En Route (~18 min)',
      role: 'Tracking Service'
    },
    {
      num: '05',
      title: 'On-Site Verification & Handshake',
      heading: 'Driver enters PIN + GPS confirms boundary',
      desc: 'NDPA-compliant proof-of-work: Handshake code 4821 validated within 900211 postal polygon.',
      postcode: '900211',
      status: 'Verified & Collected',
      role: 'Field Evidence Engine'
    },
    {
      num: '06',
      title: 'Recycling Credit & Municipal Settlement',
      heading: 'Landfill diverted; instant payout authorized',
      desc: '25kg waste sorted. ₦4,500 credited to driver wallet, ₦200 recyclable plastic rebate to resident.',
      postcode: '900211',
      status: 'Completed & Paid',
      role: 'Municipal Ledger'
    }
  ];

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Editorial Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-6 sm:pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9EFE6] border border-[#D6D0BE] text-xs font-mono text-[#173E2C]">
          <span className="w-2 h-2 rounded-full bg-[#173E2C] animate-pulse" />
          <span>Live Next.js 16 × ResolveGrid Integration</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[var(--ink)] leading-[1.15]">
          The &ldquo;Uber for Waste&rdquo; on Nigeria&apos;s National Digital Postcode.
        </h1>

        <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed font-normal max-w-2xl mx-auto">
          Transforming informal landmarks like <em>&ldquo;Yellow duplex near Banex&rdquo;</em> into verified NIPOST postcodes, on-demand licensed collector dispatch, and cryptographic proof-of-collection.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/book">
            <Button variant="primary" size="lg" className="px-6 py-3.5">
              <span>Book a Pickup (Resident)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/collector/jobs">
            <Button variant="secondary" size="lg" className="px-6 py-3.5">
              <Truck className="w-4 h-4 text-[#173E2C]" />
              <span>Collector Driver App</span>
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="px-6 py-3.5">
              <ShieldCheck className="w-4 h-4" />
              <span>AMAC Municipal Ops</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* 3 Core Experience Portals (Uber Customer, Uber Driver, Municipal Command) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-[#173E2C] transition-all group">
          <CardContent className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#E9EFE6] text-[#173E2C] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Trash2 className="w-6 h-6 text-[#173E2C]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
                Resident Portal
              </span>
              <h3 className="font-serif text-xl font-bold text-[var(--ink)] mt-0.5">
                On-Demand Customer App
              </h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Input landmarks or informal addresses, get instant NIPOST postcode verification via ResolveGrid, upfront pricing, explainable ETA, and a secure 4-digit handshake PIN.
            </p>
            <div className="pt-2 border-t border-[var(--line)]">
              <Link href="/book" className="text-xs font-mono font-semibold text-[#173E2C] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>Open Resident Booking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#173E2C] transition-all group">
          <CardContent className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#F2EAD3] text-[#7A5A12] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6 text-[#7A5A12]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
                Collector Driver Mode
              </span>
              <h3 className="font-serif text-xl font-bold text-[var(--ink)] mt-0.5">
                Uber-Style Driver App
              </h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Postcode-matched job dispatch, live GPS navigation, turn-by-turn guidance to informal landmarks, and on-site PIN handshake authentication with instant wallet payout.
            </p>
            <div className="pt-2 border-t border-[var(--line)]">
              <Link href="/collector/jobs" className="text-xs font-mono font-semibold text-[#173E2C] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>Open Collector Driver Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#173E2C] transition-all group">
          <CardContent className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#173E2C] text-[#FAF8F3] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-[#FAF8F3]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
                Municipal Authority
              </span>
              <h3 className="font-serif text-xl font-bold text-[var(--ink)] mt-0.5">
                AMAC Ops & SLA Command
              </h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              City-wide dispatch grid, postcode zone franchise monitoring, recyclable tonnage diverted, collector SLA compliance, and cryptographic audit records.
            </p>
            <div className="pt-2 border-t border-[var(--line)]">
              <Link href="/dashboard" className="text-xs font-mono font-semibold text-[#173E2C] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>View Municipal Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Interactive Tabs: Demo Lifecycle | ResolveGrid Simulator | Mobile Architecture */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
              Interactive System Harness
            </span>
            <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">
              Architecture & Integration Demonstrations
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--line)]">
            <button
              type="button"
              onClick={() => setActiveTab('showcase')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'showcase' ? 'bg-[#173E2C] text-[#FAF8F3] font-medium' : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              6-Step Lifecycle
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resolvegrid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'resolvegrid' ? 'bg-[#173E2C] text-[#FAF8F3] font-medium' : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              ResolveGrid API
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'mobile' ? 'bg-[#173E2C] text-[#FAF8F3] font-medium' : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              Mobile Apps
            </button>
          </div>
        </div>

        {/* Tab 1: 6-Step Interactive Lifecycle */}
        {activeTab === 'showcase' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-2">
              {demoSteps.map((step, idx) => (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setDemoStep(idx)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    demoStep === idx
                      ? 'border-[#173E2C] bg-[#E9EFE6] shadow-xs'
                      : 'border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    demoStep === idx ? 'bg-[#173E2C] text-[#FAF8F3]' : 'bg-[var(--surface-2)] text-[var(--muted)]'
                  }`}>
                    {step.num}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs font-serif font-bold text-[var(--ink)] block">
                      {step.title}
                    </span>
                    <span className="text-[11px] text-[var(--muted)] block">
                      {step.role}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <Card className="lg:col-span-2 border-2 border-[#173E2C]/20 bg-[#FAF8F3]">
              <CardHeader className="bg-[#E9EFE6] border-b border-[#D6D0BE]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="forest">Step {demoSteps[demoStep].num} of 06</Badge>
                    <span className="font-mono text-xs text-[#173E2C] font-semibold">
                      {demoSteps[demoStep].role}
                    </span>
                  </div>
                  <Badge variant="sage">Status: {demoSteps[demoStep].status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[var(--ink)]">
                    {demoSteps[demoStep].heading}
                  </h3>
                  <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">
                    {demoSteps[demoStep].desc}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
                    Persistent Postcode State Machine
                  </span>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                    <span className="text-[var(--ink-2)]">Anchor Postcode:</span>
                    <Badge variant="forest">#{demoSteps[demoStep].postcode}</Badge>
                    <span className="text-[var(--muted)]">•</span>
                    <span className="text-[var(--ink-2)]">Sector: AMAC Wuse 2</span>
                    <span className="text-[var(--muted)]">•</span>
                    <span className="text-[#173E2C] font-semibold">NDPA Validated</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#E3DED0]">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={demoStep === 0}
                    onClick={() => setDemoStep(Math.max(0, demoStep - 1))}
                  >
                    Previous Step
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={demoStep === demoSteps.length - 1}
                    onClick={() => setDemoStep(Math.min(demoSteps.length - 1, demoStep + 1))}
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Live ResolveGrid API Query Harness */}
        {activeTab === 'resolvegrid' && (
          <Card className="border border-[var(--line)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[var(--ink)]">
                    ResolveGrid × NIPOST Landmark Geocoding Engine
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Live endpoint: <code>/api/resolve?q=...</code> proxying with caching & NIPOST pilot fallback.
                  </p>
                </div>
                <Badge variant="forest">Tier 1–5 Ready</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <AddressResolver
                initialValue="Yellow duplex near Banex, Wuse 2"
                onResolved={(res) => setResolvedRecord(res)}
              />

              {resolvedRecord && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
                    Raw JSON Output from ResolveGrid API Contract
                  </span>
                  <pre className="p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--line)] text-xs font-mono text-[var(--ink)] overflow-x-auto">
                    {JSON.stringify(resolvedRecord, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Mobile Architecture (Uber-style) */}
        {activeTab === 'mobile' && (
          <div id="mobile-app" className="space-y-6">
            <Card className="border border-[var(--line)] p-6 sm:p-8 space-y-6">
              <div className="max-w-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="forest">Cross-Platform Mobile Strategy</Badge>
                  <span className="font-mono text-xs text-[var(--muted)]">Web PWA + Native Apps</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[var(--ink)]">
                  Deploying Trashify on Mobile Devices
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Trashify is engineered to run seamlessly across all mobile platforms — empowering residents to book pickups and collectors to navigate routes on their phones just like Uber and Uber Driver.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Method 1: Instant PWA */}
                <div className="p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] space-y-3">
                  <div className="flex items-center gap-2 text-[#173E2C] font-semibold text-sm">
                    <Smartphone className="w-4 h-4 text-[#173E2C]" />
                    <span>Option 1: Progressive Web App (Available Now)</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Zero app store downloads needed. Visiting <code>trashify.ng</code> on iOS Safari or Android Chrome lets users tap &ldquo;Install App&rdquo; or &ldquo;Add to Home Screen&rdquo; to launch as a standalone application.
                  </p>
                  <ul className="text-xs font-mono space-y-1 text-[var(--ink-2)]">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#173E2C]" /> Configured via <code>public/manifest.json</code>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#173E2C]" /> Device Geolocation for GPS proof
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#173E2C]" /> Native Camera access for waste photos
                    </li>
                  </ul>
                </div>

                {/* Method 2: Native App Capacitor / Expo */}
                <div className="p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] space-y-3">
                  <div className="flex items-center gap-2 text-[#7A5A12] font-semibold text-sm">
                    <Download className="w-4 h-4 text-[#7A5A12]" />
                    <span>Option 2: Native iOS & Android Stores (Capacitor / Expo)</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    The Next.js 16 app can be compiled directly into native iOS (.ipa) and Android (.apk) packages using Capacitor or connected to a shared Expo React Native shell.
                  </p>
                  <pre className="p-2.5 bg-[var(--surface-3)] rounded text-[11px] font-mono text-[var(--ink)] overflow-x-auto">
                    pnpm add @capacitor/core @capacitor/cli<br />
                    pnpm cap init &quot;Trashify&quot; &quot;ng.trashify.app&quot;<br />
                    pnpm cap add android &amp;&amp; pnpm cap add ios
                  </pre>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-[var(--line)] text-xs text-[var(--muted)] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
        <div>
          Trashify NG • Built with Next.js 16 &amp; ResolveGrid for 3MTT Nigeria
        </div>
        <div className="flex items-center gap-4">
          <Link href="/book" className="hover:text-[var(--ink)]">Resident</Link>
          <Link href="/collector/jobs" className="hover:text-[var(--ink)]">Collector</Link>
          <Link href="/dashboard" className="hover:text-[var(--ink)]">AMAC Ops</Link>
          <Link href="/zones" className="hover:text-[var(--ink)]">Zones</Link>
        </div>
      </footer>
    </div>
  );
}
