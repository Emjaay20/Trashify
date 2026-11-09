'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PickupJob } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  RefreshCw,
  Navigation,
  FileText
} from 'lucide-react';

function CustomerTrackContent() {
  const params = useParams();
  const jobId = (params?.jobId as string) || 'TRF-1042';

  const [job, setJob] = React.useState<PickupJob | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchJob = React.useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.job) {
          setJob(data.job);
        }
      }
    } catch (err) {
      console.error('Failed to fetch job:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobId]);

  React.useEffect(() => {
    fetchJob();
    const interval = setInterval(fetchJob, 4000);
    return () => clearInterval(interval);
  }, [fetchJob]);

  if (loading && !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#173E2C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-[var(--muted)]">Connecting to ResolveGrid live telemetry...</p>
      </div>
    );
  }

  // Fallback if not found
  const displayJob = job || {
    id: jobId,
    customerName: 'Adaeze Okonkwo',
    customerPhone: '+234 809 555 0192',
    estateName: 'Sunrise Estate',
    rawAddressInput: 'Yellow duplex near Banex, Wuse 2',
    postcodeRecord: {
      rawInput: 'Yellow duplex near Banex, Wuse 2',
      postcode: '900211',
      standardizedAddress: '14 Adetokunbo Ademola St, Wuse 2, AMAC',
      area: 'Wuse 2',
      lga: 'AMAC',
      state: 'FCT — Abuja',
      landmarkMatch: 'Banex Plaza Area (320m)',
      confidence: 0.89,
      source: 'NIPOST_OFFICIAL_API' as const,
      needsConfirmation: false,
      coordinates: { lat: 9.0765, lng: 7.4812, tierLevel: 4 as const }
    },
    wasteCategories: ['mixed', 'plastics'] as const,
    estimatedBags: 4,
    estimatedWeightKg: 24,
    scheduledDate: 'Today',
    pickupWindow: 'Morning (08:00 - 11:00)',
    priceNgn: 4500,
    recyclableCreditNgn: 200,
    status: 'collector_en_route' as const,
    collector: {
      id: 'col-musa',
      name: 'Musa Ibrahim',
      phone: '+234 803 123 4567',
      vehicle: 'Mini Truck (1.5 Ton)',
      rating: 4.9,
      verifiedPickups: 212,
      avatarInitials: 'M'
    },
    dispatchEstimate: {
      distanceKm: 3.2,
      etaMinutes: 18,
      factors: {
        baseDriveTime: 11,
        trafficMultiplier: 1.35,
        pendingStops: 1
      }
    },
    verification: {
      gpsVerified: false,
      timestamp: '',
      confirmationCode: '4821',
      actualBags: 4
    },
    createdAt: new Date().toISOString(),
    receiptIssued: false
  };

  const isCompleted = displayJob.status === 'verified_completed' || displayJob.status === 'paid';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Back Nav & Refresh */}
      <div className="flex items-center justify-between">
        <Link
          href="/book"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Book Another Pickup</span>
        </Link>

        <button
          onClick={fetchJob}
          disabled={refreshing}
          className="inline-flex items-center gap-1 text-xs font-mono text-[var(--muted)] hover:text-[var(--ink)]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#173E2C]' : ''}`} />
          <span>Live Sync</span>
        </button>
      </div>

      {/* Main Status Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant={isCompleted ? 'sage' : 'forest'}>
            {isCompleted ? 'Collection Complete' : 'Collector En Route'}
          </Badge>
          <span className="font-mono text-xs text-[var(--muted)]">Job {displayJob.id}</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--ink)]">
          {isCompleted ? 'Waste Successfully Collected' : 'Your Collector is on the Way'}
        </h1>
        <p className="text-xs text-[var(--muted)]">
          NIPOST Postcode {displayJob.postcodeRecord.postcode} • {displayJob.postcodeRecord.area}, AMAC
        </p>
      </div>

      {/* Handshake PIN Card - Uber-style physical proof-of-work */}
      <Card className="border-2 border-[#173E2C] bg-[#FAF8F3] overflow-hidden shadow-md">
        <div className="bg-[#173E2C] text-[#FAF8F3] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#E9EFE6]" />
            <span className="font-mono text-xs uppercase tracking-wider font-semibold">
              Field Handshake PIN
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#E9EFE6]/80">NDPA Compliant</span>
        </div>
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-xs text-[var(--muted)]">
            Read this 4-digit code to collector <strong>{displayJob.collector?.name || 'Musa Ibrahim'}</strong> when they arrive at your gate to verify the collection.
          </p>

          <div className="inline-block px-8 py-3 bg-[var(--surface)] border-2 border-[#9A7E4A] rounded-2xl shadow-inner">
            <span className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-[#173E2C]">
              {displayJob.verification?.confirmationCode || '4821'}
            </span>
          </div>

          {isCompleted ? (
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#173E2C] font-mono font-medium pt-1">
              <CheckCircle2 className="w-4 h-4 text-[#173E2C]" />
              <span>Cryptographic GPS & PIN Handshake Completed at {displayJob.verification?.timestamp || '07:42 AM'}</span>
            </div>
          ) : (
            <p className="text-[11px] font-mono text-[#7A5A12]">
              Do not share this code until the collector has loaded your refuse bags.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Collector Info & Explainable ETA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Driver Profile */}
        <Card>
          <CardHeader className="pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
              Assigned Collector
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#173E2C] text-[#FAF8F3] font-serif font-bold text-lg flex items-center justify-center shadow-sm">
                {displayJob.collector?.avatarInitials || 'M'}
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[var(--ink)]">
                  {displayJob.collector?.name || 'Musa Ibrahim'}
                </h3>
                <p className="text-xs text-[var(--muted)] font-mono">
                  {displayJob.collector?.vehicle || 'Mini Truck (1.5 Ton)'} • {displayJob.collector?.rating || 4.9}★
                </p>
                <p className="text-[11px] text-[#173E2C] font-mono font-medium">
                  {displayJob.collector?.verifiedPickups || 212} verified NIPOST collections
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--line)]">
              <a
                href={`tel:${displayJob.collector?.phone || '+2348031234567'}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-mono font-medium text-[var(--ink)] border border-[var(--line)] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#173E2C]" />
                <span>Call Collector ({displayJob.collector?.phone || '+234 803 123 4567'})</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Explainable ETA Factors */}
        <Card>
          <CardHeader className="pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
              Explainable ETA Breakdown
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[var(--muted)]">Estimated Arrival</span>
              <span className="font-mono text-2xl font-bold text-[#173E2C]">
                ~{displayJob.dispatchEstimate?.etaMinutes || 18} mins
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-[var(--line)] text-[var(--ink-2)]">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Straight Distance:</span>
                <span>{displayJob.dispatchEstimate?.distanceKm || 3.2} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Base Drive Time:</span>
                <span>{displayJob.dispatchEstimate?.factors?.baseDriveTime || 11} mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Urban Traffic Multiplier:</span>
                <span className="text-[#9A7E4A] font-semibold">1.35x (Abuja Peak)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Prior Collections:</span>
                <span>1 stop before you (~6 mins)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NIPOST Digital Receipt (if verified) */}
      {isCompleted && (
        <Card className="border border-[#173E2C]/30 bg-[#E9EFE6]/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#173E2C]" />
              <span className="font-mono text-xs font-bold text-[#173E2C]">
                NIPOST Official Proof-of-Collection Certificate
              </span>
            </div>
            <Badge variant="forest" size="sm">Issued</Badge>
          </div>
          <p className="text-xs text-[var(--ink-2)]">
            Verified under AMAC Waste Management By-Laws & NIPOST Digital Postal Index. 
            Cryptographic proof stored for municipal carbon credit audit.
          </p>
        </Card>
      )}
    </div>
  );
}

export default function CustomerTrackPage() {
  return (
    <React.Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3 font-mono text-xs text-[var(--muted)]">
        <div className="w-8 h-8 border-2 border-[#173E2C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Connecting to ResolveGrid live telemetry...</p>
      </div>
    }>
      <CustomerTrackContent />
    </React.Suspense>
  );
}
