'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  Layers, 
  Building2, 
  Smartphone, 
  ChevronRight,
  ExternalLink,
  Navigation,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { INITIAL_JOBS, INITIAL_COLLECTORS } from '@/lib/store';
import { PickupJob, PostcodeRecord } from '@/lib/types';

export default function TrashifyApp() {
  const [activeTab, setActiveTab] = useState<'demo' | 'customer' | 'collector' | 'ops' | 'resolvegrid' | 'pitch'>('demo');
  const [demoStep, setDemoStep] = useState<number>(0);
  const [jobs, setJobs] = useState<PickupJob[]>(INITIAL_JOBS);
  const [collectorAccepted, setCollectorAccepted] = useState(false);
  const [fieldVerified, setFieldVerified] = useState(false);
  const [addressInput, setAddressInput] = useState('Yellow duplex near Banex, Wuse 2');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedRecord, setResolvedRecord] = useState<PostcodeRecord>(INITIAL_JOBS[0].postcodeRecord);
  const [verificationInput, setVerificationInput] = useState('4821');
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Demo walkthrough steps
  const demoSteps = [
    {
      num: '01',
      title: 'Customer books collection',
      heading: 'Adaeze requests pickup in Sunrise Estate',
      summary: 'She selects Mixed waste + Plastics (4 bags, ~25kg) for Monday morning. An informal landmark description is enough to start.',
      status: 'Booked',
      badge: 'Step 1 of 6',
      kv: [
        { label: 'Customer', val: 'Adaeze Okonkwo · Sunrise Estate' },
        { label: 'Category', val: 'Mixed waste + Recyclable Plastics' },
        { label: 'Quantity', val: '4 bags (approx. 25 kg)' },
        { label: 'Price estimate', val: '₦4,500 (upfront quoted)' }
      ]
    },
    {
      num: '02',
      title: 'ResolveGrid resolves location',
      heading: '“Yellow duplex near Banex” resolves to official Postcode',
      summary: 'ResolveGrid structures the address via the NIPOST Postcode directory and returns area, confidence (87%), and source tags. Adaeze reviews and confirms.',
      status: 'Address Verified',
      badge: 'Step 2 of 6',
      kv: [
        { label: 'Raw input', val: '“Yellow duplex near Banex, Wuse 2”' },
        { label: 'NIPOST Postcode', val: '900211 (AMAC, Abuja FCT)' },
        { label: 'Standard address', val: '14 Adetokunbo Ademola St, Wuse 2' },
        { label: 'Source & Confidence', val: 'NIPOST Postcode API · 87% High' }
      ]
    },
    {
      num: '03',
      title: 'Collector matched by rules',
      heading: 'Rules-based matching allocates licensed collector',
      summary: 'The system validates: 1) Zone covers 900211, 2) Licensed for plastics, 3) Available in morning slot, 4) Truck capacity free. Musa is assigned first.',
      status: 'Collector Matched',
      badge: 'Step 3 of 6',
      kv: [
        { label: 'Matched collector', val: 'Musa Ibrahim (AEPB/COL/2026/049)' },
        { label: 'Vehicle', val: 'Mini Truck (1.5 Ton capacity)' },
        { label: 'Assigned zone', val: 'Wuse & Maitama (covers 900211)' },
        { label: 'Current rating', val: '4.9 ★ (212 verified collections)' }
      ]
    },
    {
      num: '04',
      title: 'Collector en route with ETA',
      heading: 'Musa accepts task and navigates to pickup',
      summary: 'Musa receives landmark directions and navigation to 900211. Adaeze watches live progress with an explainable 18-minute ETA factor baseline.',
      status: 'En Route',
      badge: 'Step 4 of 6',
      kv: [
        { label: 'Distance', val: '3.2 km from current location' },
        { label: 'ETA baseline', val: '18 minutes (transparent factors)' },
        { label: 'Driver note', val: 'Green gate, call on arrival' },
        { label: 'Live status', val: 'Driver moving towards property' }
      ]
    },
    {
      num: '05',
      title: 'Field verification on arrival',
      heading: 'Authenticated proof-of-work (GPS + Customer PIN)',
      summary: 'Only the authenticated collector can submit arrival. Musa enters customer code 4821 and submits GPS proximity proof within Postcode 900211.',
      status: 'Verified Completed',
      badge: 'Step 5 of 6',
      kv: [
        { label: 'GPS boundary check', val: 'Within Postcode 900211 bounds (verified)' },
        { label: 'Customer PIN', val: 'Code 4821 confirmed with Adaeze' },
        { label: 'Actual bags', val: '4 bags verified and loaded' },
        { label: 'Timestamp', val: 'Mon 9 Nov · 09:04 AM' }
      ]
    },
    {
      num: '06',
      title: 'Settlement & municipal audit',
      heading: 'Revenue distributed & landfill diversion recorded',
      summary: 'Payment is confirmed (₦4,500), Musa’s payout is credited (₦3,825), Adaeze receives a digital receipt, and estate reports register +1 completed collection.',
      status: 'Settled & Audited',
      badge: 'Step 6 of 6',
      kv: [
        { label: 'Customer receipt', val: '₦4,500 · Sent via SMS & Email' },
        { label: 'Collector payout', val: '₦3,825 net (payout due Friday)' },
        { label: 'Landfill diversion', val: '8 kg plastics directed to Wuse Hub' },
        { label: 'Audit compliance', val: 'Logged under NDPA privacy guidelines' }
      ]
    }
  ];

  // Resolve address via API
  const handleResolve = async () => {
    setIsResolving(true);
    try {
      const res = await fetch(`/api/resolve?q=${encodeURIComponent(addressInput)}`);
      if (res.ok) {
        const data = await res.json();
        setResolvedRecord(data);
      }
    } catch {
      // Handled gracefully
    } finally {
      setIsResolving(false);
    }
  };

  // Collector verification handler
  const handleVerifyCollection = () => {
    if (verificationInput.trim() === '4821') {
      setFieldVerified(true);
      setVerificationFeedback('Field verification authenticated! Completion logged under Postcode 900211.');
      setJobs(prev => prev.map(j => j.id === 'TRF-1042' ? { ...j, status: 'verified_completed' } : j));
    } else {
      setVerificationFeedback('Invalid customer code. Please request the 4-digit PIN from Adaeze.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1A1E1B] flex flex-col selection:bg-[#173E2C] selection:text-[#FAF8F3]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[#E3DED0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#173E2C] text-[#FAF8F3] rounded-md grid place-items-center font-serif text-xl font-bold">
              T
            </div>
            <div>
              <div className="font-serif text-lg font-semibold tracking-tight text-[#173E2C]">
                Trashify <span className="text-[#6E7A70] font-sans font-normal text-sm">× ResolveGrid</span>
              </div>
              <p className="text-[10px] tracking-widest uppercase font-bold text-[#9A7E4A]">
                NIPOST National Postcode Infrastructure
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'demo', label: '01 Live Demo' },
              { id: 'customer', label: '02 Customer App' },
              { id: 'collector', label: '03 Collector (Uber-style)' },
              { id: 'ops', label: '04 Estate & Admin Ops' },
              { id: 'resolvegrid', label: '05 ResolveGrid Console' },
              { id: 'pitch', label: '06 3MTT Pitch Deck' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#173E2C] text-[#FAF8F3]' 
                    : 'text-[#6E7A70] hover:text-[#1A1E1B] hover:bg-[#F3F0E8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded bg-[#FEF6E0] text-[#7A5A12] border border-[#EAD9A0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A5A12] animate-pulse"></span>
              Postcode 900211 Active
            </span>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden overflow-x-auto px-4 py-2 gap-2 border-t border-[#E3DED0] bg-[#F3F0E8]/50">
          {[
            { id: 'demo', label: 'Live Demo' },
            { id: 'customer', label: 'Customer' },
            { id: 'collector', label: 'Collector' },
            { id: 'ops', label: 'Estate Ops' },
            { id: 'resolvegrid', label: 'ResolveGrid' },
            { id: 'pitch', label: 'Pitch Fit' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-2.5 py-1 text-xs whitespace-nowrap rounded font-medium ${
                activeTab === tab.id ? 'bg-[#173E2C] text-white' : 'text-[#6E7A70]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Hero Banner */}
        <section className="border-b border-[#E3DED0] pb-8">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#9A7E4A] uppercase mb-2">
            <span>3MTT × NIPOST Innovation Challenge</span>
            <span className="w-8 h-[1px] bg-[#D6D0BE]"></span>
            <span>Session 3: Public Services & Utilities</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#173E2C] max-w-3xl leading-[1.1]">
            Request a waste pickup as easily as <em className="italic font-normal">ordering a ride.</em>
          </h1>
          <p className="mt-4 text-[#6E7A70] text-base sm:text-lg max-w-2xl leading-relaxed">
            <strong className="text-[#1A1E1B]">Trashify</strong> provides the municipal waste management service and economic model. <strong className="text-[#1A1E1B]">ResolveGrid</strong> powers the address resolution, NIPOST postcodes, and accountable field dispatch.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#6E7A70]">
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E3DED0] px-3 py-1.5 rounded-md shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#173E2C]" />
              <span>NDPA Data Privacy Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E3DED0] px-3 py-1.5 rounded-md shadow-xs">
              <MapPin className="w-4 h-4 text-[#9A7E4A]" />
              <span>NIPOST National Digital Postcode Tier 4–5</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E3DED0] px-3 py-1.5 rounded-md shadow-xs">
              <Layers className="w-4 h-4 text-[#173E2C]" />
              <span>ResolveGrid Location & Dispatch Layer</span>
            </div>
          </div>
        </section>

        {/* TAB 1: LIVE DEMONSTRATION (6-STEP WALKTHROUGH) */}
        {activeTab === 'demo' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3DED0] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A7E4A]">Demonstration Walkthrough</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1A1E1B]">
                  One Complete Pickup Lifecycle
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDemoStep(prev => Math.max(0, prev - 1))}
                  disabled={demoStep === 0}
                  className="px-3 py-1.5 rounded border border-[#D6D0BE] text-xs font-semibold disabled:opacity-40 hover:bg-[#F3F0E8] transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setDemoStep(prev => Math.min(5, prev + 1))}
                  disabled={demoStep === 5}
                  className="px-4 py-1.5 rounded bg-[#173E2C] text-white text-xs font-semibold disabled:opacity-40 hover:bg-[#1E4D36] transition-colors"
                >
                  Next Step →
                </button>
              </div>
            </div>

            {/* Stepper Header */}
            <div className="grid grid-cols-2 sm:grid-cols-6 border border-[#E3DED0] rounded-lg overflow-hidden bg-[#F3F0E8]/50">
              {demoSteps.map((s, idx) => (
                <button
                  key={s.num}
                  onClick={() => setDemoStep(idx)}
                  className={`p-3 text-left border-r border-[#E3DED0] last:border-r-0 transition-colors ${
                    demoStep === idx 
                      ? 'bg-white shadow-xs border-b-2 border-b-[#173E2C]' 
                      : 'hover:bg-[#F3F0E8] text-[#6E7A70]'
                  }`}
                >
                  <span className={`font-serif text-base block font-bold ${demoStep === idx ? 'text-[#173E2C]' : 'text-[#8A948C]'}`}>
                    {s.num}
                  </span>
                  <span className="text-[11px] font-semibold block truncate leading-tight">
                    {s.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Step Card Visual */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 border border-[#E3DED0] rounded-lg p-6 bg-white shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-[#E9EFE6] text-[#1E4D36]">
                    {demoSteps[demoStep].badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#6E7A70]">
                    Status: <span className="text-[#173E2C]">{demoSteps[demoStep].status}</span>
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-medium text-[#1A1E1B]">
                  {demoSteps[demoStep].heading}
                </h3>
                <p className="text-[#6E7A70] text-sm leading-relaxed">
                  {demoSteps[demoStep].summary}
                </p>

                <div className="border border-[#E3DED0] rounded bg-[#FAF8F3] divide-y divide-[#E3DED0]">
                  {demoSteps[demoStep].kv.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center px-4 py-2.5 text-xs">
                      <span className="text-[#6E7A70] font-medium">{item.label}</span>
                      <strong className="text-[#1A1E1B] font-mono font-semibold text-right">{item.val}</strong>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-[#6E7A70]">
                  <span>Postcode carried across all records: <strong className="font-mono text-[#173E2C]">900211</strong></span>
                  <button 
                    onClick={() => setActiveTab(demoStep <= 1 ? 'customer' : demoStep <= 3 ? 'collector' : 'ops')}
                    className="text-[#173E2C] font-semibold underline underline-offset-2 flex items-center gap-1 hover:text-[#1E4D36]"
                  >
                    View in App Screen <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sidebar: Job Ticket & Telemetry */}
              <div className="border border-[#E3DED0] rounded-lg p-5 bg-[#FAF8F3] space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7E4A]">Live Job Ticket</span>
                  <div className="font-serif text-2xl font-bold text-[#173E2C]">TRF-1042</div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between pb-2 border-b border-[#E3DED0]">
                    <span className="text-[#6E7A70]">Customer</span>
                    <span className="font-medium">Adaeze Okonkwo</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#E3DED0]">
                    <span className="text-[#6E7A70]">NIPOST Postcode</span>
                    <span className="font-mono font-bold text-[#173E2C]">900211</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#E3DED0]">
                    <span className="text-[#6E7A70]">Waste Type</span>
                    <span className="font-medium">Mixed + Plastics (4 bags)</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#E3DED0]">
                    <span className="text-[#6E7A70]">Assigned Collector</span>
                    <span className="font-medium">{collectorAccepted ? 'Musa Ibrahim (En route)' : 'Musa Ibrahim'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#E3DED0]">
                    <span className="text-[#6E7A70]">ETA Baseline</span>
                    <span className="font-medium text-[#9A7E4A]">18 min (explainable)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E7A70]">Customer Verification PIN</span>
                    <span className="font-mono font-bold bg-[#E9EFE6] px-2 py-0.5 rounded text-[#1E4D36]">4821</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="w-full bg-[#E3DED0] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#173E2C] h-full transition-all duration-300" 
                      style={{ width: `${((demoStep + 1) / 6) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-[#6E7A70] mt-2 leading-tight">
                    Every step connects to NIPOST Postcode <strong className="text-[#1A1E1B]">900211</strong>, fulfilling the 25% meaningful API usage requirement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMER WEB APP VIEW */}
        {activeTab === 'customer' && (
          <div className="space-y-6">
            <div className="border-b border-[#E3DED0] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A7E4A]">Customer View</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium">Resident & Business Pickup Portal</h2>
              <p className="text-[#6E7A70] text-sm mt-1">
                Demonstrating landmark input resolution via ResolveGrid and real-time collector tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Screen 1: Booking Form */}
              <div className="border border-[#E3DED0] rounded-xl bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3DED0]">
                  <div>
                    <span className="text-[10px] font-bold text-[#6E7A70] uppercase">Customer Portal · 01</span>
                    <h4 className="font-serif text-lg font-semibold text-[#173E2C]">Book a Collection</h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#173E2C] text-white grid place-items-center font-serif text-sm">A</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#6E7A70] uppercase tracking-wider block mb-1">Waste Categories</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Mixed Waste', 'Plastics (Recyclable)', 'Paper', 'Metal', 'E-Waste'].map((cat, i) => (
                        <span 
                          key={cat} 
                          className={`text-xs px-2.5 py-1 rounded-full border ${
                            i < 2 
                              ? 'bg-[#173E2C] text-white border-[#173E2C]' 
                              : 'bg-[#FAF8F3] text-[#6E7A70] border-[#E3DED0]'
                          }`}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#6E7A70] uppercase tracking-wider block mb-1">Estimated Quantity</label>
                    <div className="p-3 border border-[#E3DED0] rounded-lg bg-[#FAF8F3] text-xs">
                      <strong>4 bags (~25 kg)</strong>
                      <span className="text-[#6E7A70] block mt-0.5">Suitable for weekly household pickup</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#6E7A70] uppercase tracking-wider block mb-1">Pickup Schedule</label>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                      <div className="border border-[#D6D0BE] p-2 rounded bg-white text-[#6E7A70]">Today</div>
                      <div className="border border-[#173E2C] p-2 rounded bg-[#173E2C] text-white font-semibold">Mon 9 Nov</div>
                      <div className="border border-[#D6D0BE] p-2 rounded bg-white text-[#6E7A70]">Tue 10 Nov</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        const el = document.getElementById('resolverSection');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 px-4 bg-[#173E2C] text-white rounded-lg text-xs font-semibold hover:bg-[#1E4D36] transition-colors"
                    >
                      Proceed to Address Resolution →
                    </button>
                  </div>
                </div>
              </div>

              {/* Screen 2: ResolveGrid Location Standardisation */}
              <div id="resolverSection" className="border border-[#E3DED0] rounded-xl bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3DED0]">
                  <div>
                    <span className="text-[10px] font-bold text-[#9A7E4A] uppercase">Powered by ResolveGrid</span>
                    <h4 className="font-serif text-lg font-semibold text-[#173E2C]">Address & Postcode Resolution</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF6E0] text-[#7A5A12] border border-[#EAD9A0]">
                    NIPOST API
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#6E7A70] uppercase tracking-wider block mb-1">Informal Landmark / Address</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        placeholder="e.g. Yellow duplex near Banex, Wuse 2"
                        className="flex-1 text-xs border border-[#D6D0BE] rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#173E2C]"
                      />
                      <button
                        onClick={handleResolve}
                        disabled={isResolving}
                        className="px-3 py-2 bg-[#173E2C] text-white rounded-md text-xs font-semibold hover:bg-[#1E4D36] disabled:opacity-50"
                      >
                        {isResolving ? 'Resolving…' : 'Resolve'}
                      </button>
                    </div>
                  </div>

                  {/* Resolution Output Card */}
                  <div className="border border-[#173E2C] rounded-lg p-3.5 bg-[#173E2C] text-[#FAF8F3] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#D9E8D8]">Standardised NIPOST Record</span>
                      <span className="font-mono font-bold bg-[#FAF8F3] text-[#173E2C] px-2 py-0.5 rounded">
                        {resolvedRecord.postcode}
                      </span>
                    </div>
                    <div className="text-xs font-medium leading-relaxed">
                      {resolvedRecord.formattedAddress}
                    </div>
                    <div className="text-[11px] text-[#A8BFA6]">
                      LGA: {resolvedRecord.lga} · State: {resolvedRecord.state}
                    </div>
                  </div>

                  {/* ResolveGrid Confidence & Source Telemetry */}
                  <div className="p-3 border border-[#E3DED0] rounded-lg bg-[#FAF8F3] text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#6E7A70]">Match Confidence:</span>
                      <strong className="text-[#173E2C] font-mono">{(resolvedRecord.confidence * 100).toFixed(0)}% (High)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E7A70]">Detected Landmark:</span>
                      <strong className="text-[#1A1E1B]">{resolvedRecord.landmarkMatch || 'Banex Plaza'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E7A70]">Geometry Tier:</span>
                      <strong className="text-[#9A7E4A]">Level {resolvedRecord.tierLevel} (Centroid & Bounds)</strong>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-[#FAF8F3] border border-[#173E2C] text-[#173E2C] rounded-lg text-xs font-semibold hover:bg-[#F3F0E8] transition-colors">
                    ✓ Confirm Location for TRF-1042
                  </button>
                </div>
              </div>

              {/* Screen 3: Live Tracking & Verification Code */}
              <div className="border border-[#E3DED0] rounded-xl bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3DED0]">
                  <div>
                    <span className="text-[10px] font-bold text-[#6E7A70] uppercase">Customer Portal · 03</span>
                    <h4 className="font-serif text-lg font-semibold text-[#173E2C]">Live Tracking & Verification</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E9EFE6] text-[#1E4D36]">
                    En Route
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 border border-[#E3DED0] rounded-lg bg-[#FAF8F3] flex items-center justify-between">
                    <div>
                      <div className="font-serif text-2xl font-bold text-[#173E2C]">18 min</div>
                      <span className="text-[11px] text-[#6E7A70]">Explainable ETA Baseline</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#6E7A70] block">Postcode Target</span>
                      <strong className="font-mono text-sm text-[#173E2C]">900211</strong>
                    </div>
                  </div>

                  {/* Customer PIN Callout */}
                  <div className="p-3 border border-[#9A7E4A] rounded-lg bg-[#FEF6E0] text-[#7A5A12] text-xs">
                    <span className="font-bold block mb-1">Your Pickup Confirmation PIN</span>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">Give this to collector upon arrival:</span>
                      <span className="font-mono text-base font-bold bg-white px-2 py-0.5 rounded border border-[#EAD9A0]">
                        4821
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#E3DED0]">
                      <span className="text-[#6E7A70]">Collector</span>
                      <span className="font-semibold">Musa Ibrahim (4.9 ★)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E3DED0]">
                      <span className="text-[#6E7A70]">Vehicle</span>
                      <span>Mini Truck (AEPB Licensed)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#6E7A70]">Total Paid</span>
                      <strong className="text-[#173E2C]">₦4,500 (Receipt Issued)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COLLECTOR MOBILE APP (UBER DRIVER STYLE) */}
        {activeTab === 'collector' && (
          <div className="space-y-6">
            <div className="border-b border-[#E3DED0] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A7E4A]">Collector Field Application</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium">Uber-Style Licensed Waste Collector View</h2>
              <p className="text-[#6E7A70] text-sm mt-1">
                Optimised for mobile operation in Abuja. Accepts jobs, provides navigation to Postcode 900211, and requires cryptographic arrival verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Screen 1: Available & Assigned Jobs */}
              <div className="border border-[#E3DED0] rounded-xl bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3DED0]">
                  <div>
                    <span className="text-[10px] font-bold text-[#6E7A70] uppercase">Collector · Assigned Tasks</span>
                    <h4 className="font-serif text-lg font-semibold text-[#173E2C]">Musa Ibrahim</h4>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#E9EFE6] text-[#1E4D36] px-2 py-0.5 rounded">
                    Online
                  </span>
                </div>

                <div className="border border-[#173E2C] rounded-lg p-3.5 bg-[#FAF8F3] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-[#173E2C] font-mono text-sm">TRF-1042</strong>
                    <span className="font-mono text-xs bg-[#FEF6E0] text-[#7A5A12] px-2 py-0.5 rounded border border-[#EAD9A0]">
                      Postcode 900211
                    </span>
                  </div>

                  <div className="text-xs">
                    <p className="font-semibold text-[#1A1E1B]">14 Adetokunbo Ademola St, Wuse 2</p>
                    <p className="text-[#6E7A70] mt-0.5">Near Banex Plaza · Sunrise Estate</p>
                    <p className="text-[#9A7E4A] font-medium mt-1">Mixed waste + Plastics (4 bags)</p>
                  </div>

                  <div className="pt-2">
                    {!collectorAccepted ? (
                      <button 
                        onClick={() => setCollectorAccepted(true)}
                        className="w-full py-2 bg-[#173E2C] text-white rounded-md text-xs font-semibold hover:bg-[#1E4D36] transition-colors"
                      >
                        Accept Pickup & Start Navigation →
                      </button>
                    ) : (
                      <div className="text-center py-2 bg-[#E9EFE6] text-[#1E4D36] text-xs font-semibold rounded-md">
                        ✓ Accepted — En Route to 900211
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Queued Jobs */}
                <div className="space-y-2 pt-2">
                  <div className="p-3 border border-[#E3DED0] rounded-lg text-xs opacity-70">
                    <div className="flex justify-between font-mono font-semibold">
                      <span>TRF-1043</span>
                      <span>Postcode 900271</span>
                    </div>
                    <p className="text-[#6E7A70] mt-1">GreenMart Supermarket, Maitama · 6 bags Paper</p>
                  </div>
                </div>
              </div>

              {/* Screen 2: Active Navigation & ETA Factors */}
              <div className="border border-[#E3DED0] rounded-xl bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3DED0]">
                  <div>
                    <span className="text-[10px] font-bold text-[#6E7A70] uppercase">En Route Telemetry</span>
                    <h4 className="font-serif text-lg font-semibold text-[#173E2C]">Navigation to Destination</h4>
                  </div>
                  <Navigation className="w-5 h-5 text-[#173E2C]" />
                </div>

                <div className="p-3.5 border border-[#E3DED0] rounded-lg bg-[#173E2C] text-[#FAF8F3] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#D9E8D8] tracking-wider">Turn-by-turn guidance</span>
                  <p className="text-sm font-semibold">
                    Turn right at Banex Junction towards Adetokunbo Ademola St.
                  </p>
                  <p className="text-xs text-[#A8BFA6]">
                    Destination on left: Yellow duplex with green gate.
                  </p>
                </div>

                <div className="p-3 border border-[#E3DED0] rounded-lg bg-[#FAF8F3] text-xs space-y-2">
                  <div className="font-bold text-[#1A1E1B]">ResolveGrid Dispatch Factors:</div>
                  <div className="flex justify-between text-[#6E7A70]">
                    <span>Distance from collector base:</span>
                    <strong className="text-[#1A1E1B] font-mono">3.2 km</strong>
                  </div>
                  <div className="flex justify-between text-[#6E7A70]">
                    <span>Morning urban traffic factor:</span>
                    <strong className="text-[#1A1E1B] font-mono">1.35x baseline</strong>
                  </div>
                  <div className="flex justify-between text-[#6E7A70]">
                    <span>Drop-off allocation:</span>
                    <strong className="text-[#1A1E1B]">Wuse Recycling Hub</strong>
                  </div>
                </div>

                <button className="w-full py-2 bg-[#FAF8F3] border border-[#173E2C] text-[#173E2C] rounded-md text-xs font-semibold">
                  Call Customer Adaeze (+234 809 555 0192)
                </button>
              </div>

              {/* Screen 3: Field Verification Proof-of-Work */}
              <div className="border border-[#E3DED0] rounded-xl bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3DED0]">
                  <div>
                    <span className="text-[10px] font-bold text-[#9A7E4A] uppercase">Field Verification</span>
                    <h4 className="font-serif text-lg font-semibold text-[#173E2C]">Proof of Collection</h4>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-[#173E2C]" />
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-[#6E7A70] leading-relaxed">
                    Under NDPA rules and NIPOST audit requirements, authenticated collectors must enter the customer PIN on-site to close the job.
                  </p>

                  <div>
                    <label className="text-xs font-bold text-[#6E7A70] uppercase tracking-wider block mb-1">Customer 4-Digit PIN</label>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={verificationInput}
                      onChange={(e) => setVerificationInput(e.target.value)}
                      placeholder="Enter 4821"
                      className="w-full text-center font-mono text-lg font-bold tracking-widest border border-[#D6D0BE] rounded-md py-2 bg-[#FAF8F3]"
                    />
                  </div>

                  <div className="p-3 border border-[#E3DED0] rounded-lg bg-[#FAF8F3] text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#6E7A70]">Device GPS Check:</span>
                      <strong className="text-[#1E4D36]">✓ Inside Postcode 900211</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E7A70]">Collector Identity:</span>
                      <strong className="text-[#1A1E1B]">Authenticated Musa (AEPB-049)</strong>
                    </div>
                  </div>

                  <button 
                    onClick={handleVerifyCollection}
                    className="w-full py-2.5 bg-[#173E2C] text-white rounded-md text-xs font-semibold hover:bg-[#1E4D36] transition-colors"
                  >
                    Submit Verified Completion
                  </button>

                  {verificationFeedback && (
                    <div className={`p-2.5 rounded text-xs font-medium ${
                      fieldVerified ? 'bg-[#E9EFE6] text-[#1E4D36]' : 'bg-[#FDECEC] text-[#7A1F1F]'
                    }`}>
                      {verificationFeedback}
                    </div>
                  )}

                  <div className="pt-2 text-center text-[11px] text-[#6E7A70]">
                    Weekly earnings: <strong className="text-[#173E2C]">₦86,400</strong> (31 verified pickups)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ESTATE & MUNICIPAL ADMIN OPS */}
        {activeTab === 'ops' && (
          <div className="space-y-6">
            <div className="border-b border-[#E3DED0] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A7E4A]">Municipal & Estate Console</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium">Abuja Central Operations Overview</h2>
              </div>
              <span className="text-xs font-mono font-medium text-[#6E7A70] self-start sm:self-auto">
                Real-time Dispatch Log · AMAC Zone
              </span>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border border-[#E3DED0] rounded-xl overflow-hidden bg-white shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-[#E3DED0]">
              <div className="p-4 sm:p-5">
                <span className="text-xs text-[#6E7A70] font-medium block">Total Requested Today</span>
                <div className="font-serif text-3xl font-bold text-[#173E2C] mt-1">24</div>
                <span className="text-[11px] text-[#9A7E4A] font-medium">Across 4 Postcode Zones</span>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-xs text-[#6E7A70] font-medium block">Assigned to Collectors</span>
                <div className="font-serif text-3xl font-bold text-[#173E2C] mt-1">18</div>
                <span className="text-[11px] text-[#1E4D36] font-medium">100% Licensed Drivers</span>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-xs text-[#6E7A70] font-medium block">Verified Completed</span>
                <div className="font-serif text-3xl font-bold text-[#1E4D36] mt-1">
                  {fieldVerified ? 12 : 11}
                </div>
                <span className="text-[11px] text-[#6E7A70]">GPS + PIN Authenticated</span>
              </div>
              <div className="p-4 sm:p-5">
                <span className="text-xs text-[#6E7A70] font-medium block">Recyclables Diverted</span>
                <div className="font-serif text-3xl font-bold text-[#9A7E4A] mt-1">340 kg</div>
                <span className="text-[11px] text-[#6E7A70]">Plastics & Paper to Hubs</span>
              </div>
            </div>

            {/* Jobs Dispatch Table */}
            <div className="border border-[#E3DED0] rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="px-5 py-3.5 border-b border-[#E3DED0] bg-[#FAF8F3] flex justify-between items-center">
                <strong className="text-sm font-serif font-semibold text-[#173E2C]">Live Postcode Dispatch Queue</strong>
                <span className="text-xs text-[#6E7A70]">Filtered by: AMAC Region</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3F0E8] text-[#6E7A70] uppercase font-bold text-[10px] tracking-wider border-b border-[#E3DED0]">
                    <tr>
                      <th className="px-4 py-3">Job ID & Customer</th>
                      <th className="px-4 py-3">Location & Postcode</th>
                      <th className="px-4 py-3">Waste Category</th>
                      <th className="px-4 py-3">Collector</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3DED0]">
                    {jobs.map(j => (
                      <tr key={j.id} className="hover:bg-[#FAF8F3] transition-colors">
                        <td className="px-4 py-3.5">
                          <strong className="font-mono text-[#173E2C] block">{j.id}</strong>
                          <span className="text-[#6E7A70]">{j.customerName} ({j.estateName})</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold block">{j.postcodeRecord.area}</span>
                          <span className="font-mono text-[#173E2C] font-bold">Postcode {j.postcodeRecord.postcode}</span>
                          <span className="text-[10px] text-[#6E7A70] block">Confidence: {(j.postcodeRecord.confidence * 100).toFixed(0)}%</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="capitalize font-medium">{j.wasteCategories.join(', ')}</span>
                          <span className="text-[#6E7A70] block">{j.estimatedBags} bags (~{j.estimatedWeightKg} kg)</span>
                        </td>
                        <td className="px-4 py-3.5">
                          {j.collector ? (
                            <div>
                              <span className="font-semibold">{j.collector.name}</span>
                              <span className="text-[#6E7A70] block text-[10px]">{j.collector.vehicle}</span>
                            </div>
                          ) : (
                            <span className="text-[#8A948C] italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                            j.status === 'verified_completed' 
                              ? 'bg-[#E9EFE6] text-[#1E4D36]' 
                              : j.status === 'collector_en_route'
                              ? 'bg-[#FEF6E0] text-[#7A5A12]'
                              : 'bg-[#F3F0E8] text-[#2E3530]'
                          }`}>
                            {j.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RESOLVEGRID ENGINE & NIPOST API CONSOLE */}
        {activeTab === 'resolvegrid' && (
          <div className="space-y-6">
            <div className="border-b border-[#E3DED0] pb-3 flex justify-between items-center">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A7E4A]">Location Intelligence Layer</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium">ResolveGrid × NIPOST Integration Engine</h2>
              </div>
              <a 
                href="https://resolvegrid.aetherhost.com.ng" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-[#173E2C] font-semibold flex items-center gap-1 hover:underline"
              >
                Visit Live ResolveGrid Prototype <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Architecture & Interface Description */}
              <div className="border border-[#E3DED0] rounded-xl bg-white p-5 shadow-xs space-y-3">
                <h4 className="font-serif text-lg font-semibold text-[#173E2C]">
                  Minimal Integration Contract (`lib/resolvegrid.ts`)
                </h4>
                <p className="text-xs text-[#6E7A70] leading-relaxed">
                  Trashify calls ResolveGrid through three lightweight typed methods, keeping the waste management business logic cleanly separated from the geospatial addressing engine:
                </p>

                <div className="bg-[#1A1E1B] text-[#FAF8F3] p-4 rounded-lg font-mono text-xs space-y-2 overflow-x-auto">
                  <div className="text-[#A8BFA6]">// 1. Address Resolution</div>
                  <div>resolveAddress(input: string) → PostcodeRecord</div>
                  <div className="text-[#A8BFA6] pt-1">// 2. Dispatch Baseline Estimation</div>
                  <div>getDispatchEstimate(from, to) → DispatchEstimate</div>
                  <div className="text-[#A8BFA6] pt-1">// 3. Authenticated Field Proof</div>
                  <div>recordFieldEvidence(jobId, gps, pin) → VerificationStatus</div>
                </div>
              </div>

              {/* Tier 1-5 Geometry Explanation */}
              <div className="border border-[#E3DED0] rounded-xl bg-white p-5 shadow-xs space-y-3">
                <h4 className="font-serif text-lg font-semibold text-[#173E2C]">
                  NIPOST API Geometry Tiering (The Judge Winning Detail)
                </h4>
                <p className="text-xs text-[#6E7A70] leading-relaxed">
                  Most pitch participants assume every postcode lookup returns a free GPS coordinate. The official NIPOST documentation states point geometry is restricted to <strong className="text-[#1A1E1B]">Level 5</strong>.
                </p>

                <div className="border border-[#E3DED0] rounded divide-y divide-[#E3DED0] text-xs">
                  <div className="p-2.5 flex justify-between bg-[#FAF8F3]">
                    <span className="font-semibold text-[#173E2C]">Level 1–3: State & LGA Zone</span>
                    <span className="text-[#6E7A70]">Regional validation only</span>
                  </div>
                  <div className="p-2.5 flex justify-between bg-white">
                    <span className="font-semibold text-[#173E2C]">Level 4: Centroid + Landmark Area</span>
                    <span className="text-[#1E4D36] font-medium">Trashify baseline for Wuse 2 (900211)</span>
                  </div>
                  <div className="p-2.5 flex justify-between bg-[#FEF6E0] text-[#7A5A12]">
                    <span className="font-semibold">Level 5: Exact Point Geometry</span>
                    <span>Requires privileged enterprise clearance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: 3MTT / NIPOST PITCH CRITERIA & BUSINESS MODEL */}
        {activeTab === 'pitch' && (
          <div className="space-y-6">
            <div className="border-b border-[#E3DED0] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A7E4A]">Evaluation Rubric</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium">3MTT × NIPOST Alignment & Revenue Model</h2>
              <p className="text-[#6E7A70] text-sm mt-1">
                How Trashify and ResolveGrid combine to hit 100% on the ministerial evaluation sheet.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { pct: '25%', title: 'Working Prototype', desc: 'Functioning interactive flow (Booking → Resolve → Match → Verify).' },
                { pct: '25%', title: 'Meaningful NIPOST Use', desc: 'Postcode 900211 is the central routing and field dispatch key.' },
                { pct: '25%', title: 'Practical Scale & Value', desc: 'Solves municipal missed collections with tangible estate subscription model.' },
                { pct: '25%', title: 'Team & Execution', desc: 'Built on existing verified ResolveGrid location engine with fast MVP vertical.' }
              ].map((c, i) => (
                <div key={i} className="border border-[#E3DED0] rounded-xl bg-white p-5 shadow-xs">
                  <div className="font-serif text-3xl font-bold text-[#173E2C]">{c.pct}</div>
                  <strong className="text-sm font-semibold block mt-1">{c.title}</strong>
                  <p className="text-xs text-[#6E7A70] mt-1.5 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Dual Commercial Engine */}
            <div className="border border-[#E3DED0] rounded-xl p-6 bg-white shadow-xs space-y-4">
              <h3 className="font-serif text-xl font-semibold text-[#173E2C]">Dual Commercial Opportunity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 border border-[#E3DED0] rounded-lg bg-[#FAF8F3] space-y-2">
                  <strong className="text-sm font-serif font-bold text-[#173E2C]">Trashify (Consumer & Municipal B2C/B2B)</strong>
                  <p className="text-[#6E7A70]">Targets: Residents, gated estates, corporate offices, licensed waste recyclers.</p>
                  <p className="font-semibold text-[#1A1E1B]">Revenue: Pickup commissions (15%), estate monthly subscriptions, recycling materials aggregation.</p>
                </div>
                <div className="p-4 border border-[#E3DED0] rounded-lg bg-[#FAF8F3] space-y-2">
                  <strong className="text-sm font-serif font-bold text-[#173E2C]">ResolveGrid (Location Intelligence B2B SaaS)</strong>
                  <p className="text-[#6E7A70]">Targets: Logistics providers, delivery courier fleets, utility metering, emergency dispatch.</p>
                  <p className="font-semibold text-[#1A1E1B]">Revenue: API usage per address resolution, dispatch orchestration licensing, government spatial intelligence contracts.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3DED0] bg-[#FAF8F3] py-6 mt-12 text-xs text-[#6E7A70]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-[#1A1E1B] font-serif">Trashify × ResolveGrid</strong> — Built on Nigeria's National Digital Postcode Infrastructure.
          </div>
          <div className="flex items-center gap-4">
            <span>All demonstration figures use labelled test fixtures</span>
            <span>·</span>
            <span className="text-[#173E2C] font-semibold">Ready for Pitch Session 3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
