'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PickupJob } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Camera, 
  Phone,
  AlertTriangle,
  ExternalLink,
  Lock
} from 'lucide-react';

function ActiveJobContent() {
  const params = useParams();
  const router = useRouter();
  const jobId = (params?.jobId as string) || 'TRF-1042';

  const [job, setJob] = React.useState<PickupJob | null>(null);
  const [pinCode, setPinCode] = React.useState('');
  const [verifying, setVerifying] = React.useState(false);
  const [verificationResult, setVerificationResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [gpsVerified, setGpsVerified] = React.useState(false);
  const [photoUploaded, setPhotoUploaded] = React.useState(false);

  React.useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.job) {
            setJob(data.job);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadJob();
  }, [jobId]);

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
    verification: {
      gpsVerified: false,
      timestamp: '',
      confirmationCode: '4821',
      actualBags: 4
    }
  };

  const handleVerifyEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.trim()) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: displayJob.id,
          collectorId: 'col-musa',
          postcode: displayJob.postcodeRecord.postcode,
          customerConfirmationCode: pinCode.trim(),
          gpsLocation: {
            lat: displayJob.postcodeRecord.coordinates?.lat || 9.0765,
            lng: displayJob.postcodeRecord.coordinates?.lng || 7.4812,
            accuracyMeters: 4.2,
            isWithinPostcodeBoundary: true
          },
          wastePhotoUrl: photoUploaded ? 'https://trashify.ng/uploads/waste-proof.jpg' : undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.verified) {
        setVerificationResult({
          success: true,
          message: data.message || 'Collection verified and payout authorized!'
        });
      } else {
        setVerificationResult({
          success: false,
          message: data.message || 'Verification PIN did not match customer record.'
        });
      }
    } catch (err: unknown) {
      setVerificationResult({
        success: false,
        message: (err as Error).message
      });
    } finally {
      setVerifying(false);
    }
  };

  const isCompleted = displayJob.status === 'verified_completed' || verificationResult?.success;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Back Link */}
      <Link
        href="/collector/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] hover:text-[var(--ink)]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dispatch Board</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="forest">Active Route</Badge>
            <span className="font-mono text-xs text-[var(--muted)]">{displayJob.id}</span>
            <Badge variant="neutral" size="sm">Postcode {displayJob.postcodeRecord.postcode}</Badge>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)] mt-1">
            Navigate to {displayJob.postcodeRecord.area}
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Customer: {displayJob.customerName} • {displayJob.estateName || 'Urban Gate'}
          </p>
        </div>

        <div className="text-right">
          <span className="font-serif text-xl font-bold text-[#173E2C]">
            ₦{displayJob.priceNgn.toLocaleString()}
          </span>
          <p className="text-[10px] font-mono text-[var(--muted)]">Guaranteed Payout</p>
        </div>
      </div>

      {/* Turn-by-Turn Navigation Simulator */}
      <Card className="border border-[var(--line)] overflow-hidden">
        <div className="bg-[#173E2C] text-[#FAF8F3] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#FAF8F3]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider">
              Turn-by-Turn Postcode Guidance
            </span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayJob.postcodeRecord.standardizedAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-[#FAF8F3]/80 hover:text-white flex items-center gap-1 underline underline-offset-2"
          >
            <span>External GPS</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <CardContent className="p-5 space-y-4">
          <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--line)] flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#173E2C] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[var(--ink)]">
                {displayJob.postcodeRecord.standardizedAddress}
              </p>
              <p className="text-xs text-[var(--muted)]">
                Landmark match: {displayJob.postcodeRecord.landmarkMatch || 'Near Banex Plaza'}
              </p>
              <p className="text-[11px] font-mono text-[#173E2C]">
                GPS Target: {displayJob.postcodeRecord.coordinates?.lat}, {displayJob.postcodeRecord.coordinates?.lng} (Tier {displayJob.postcodeRecord.coordinates?.tierLevel || 4})
              </p>
            </div>
          </div>

          {/* Navigation Waypoints */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-[var(--surface-2)]/50">
              <span className="w-5 h-5 rounded-full bg-[#173E2C] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
              <span>Proceed northeast along Adetokunbo Ademola Crescent (800m)</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-[var(--surface-2)]/50">
              <span className="w-5 h-5 rounded-full bg-[#173E2C] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
              <span>Pass Banex Plaza roundabout; take 2nd exit into residential grid (320m)</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-[#E9EFE6] text-[#173E2C]">
              <span className="w-5 h-5 rounded-full bg-[#173E2C] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
              <span className="font-semibold">Arrive at landmark duplex gate on left (Postcode 900211)</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <a
              href={`tel:${displayJob.customerPhone}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-mono border border-[var(--line)]"
            >
              <Phone className="w-3.5 h-3.5 text-[#173E2C]" />
              <span>Call Resident ({displayJob.customerPhone})</span>
            </a>

            <Button
              type="button"
              variant={gpsVerified ? 'outline' : 'primary'}
              size="sm"
              onClick={() => setGpsVerified(true)}
            >
              {gpsVerified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#173E2C]" />
                  <span>GPS Arrival Confirmed</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Confirm GPS Arrival</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Handshake Authentication Form */}
      <Card className="border-2 border-[#173E2C]/30 bg-[#FAF8F3]">
        <CardHeader className="bg-[#E9EFE6] rounded-t-xl border-b border-[#D6D0BE]">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-[#173E2C] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#173E2C]" />
              <span>Step 2: Authenticate Field Handshake</span>
            </h2>
            <span className="text-[10px] font-mono text-[#173E2C]">NDPA Proof-of-Work</span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            To prevent ghost runs and trigger instant bank crediting, ask the resident for their <strong>4-digit Trashify PIN</strong> displayed on their screen upon bag inspection.
          </p>

          <form onSubmit={handleVerifyEvidence} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                  Customer 4-Digit PIN
                </label>
                <span className="text-[11px] font-mono text-[var(--muted)]">
                  (Test demo PIN: <strong className="text-[#173E2C]">4821</strong>)
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 4821"
                  disabled={isCompleted}
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl sm:text-3xl py-3 bg-[var(--surface)] border-2 border-[var(--line)] focus:border-[#173E2C] rounded-xl focus:outline-none"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              </div>
            </div>

            {/* Waste photo capture simulation */}
            <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--line)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#173E2C]" />
                <span className="text-xs font-mono text-[var(--ink)]">
                  Proof of Refuse Bags Loaded
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPhotoUploaded(!photoUploaded)}
                className={`text-xs font-mono px-3 py-1 rounded-md border transition-all ${
                  photoUploaded
                    ? 'bg-[#E9EFE6] text-[#173E2C] border-[#173E2C]'
                    : 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:bg-[var(--surface-3)]'
                }`}
              >
                {photoUploaded ? 'Photo Attached ✓' : 'Snap / Upload'}
              </button>
            </div>

            {verificationResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  verificationResult.success
                    ? 'bg-[#E9EFE6] border-[#173E2C] text-[#173E2C]'
                    : 'bg-[#FDECEC] border-[#FCD5D5] text-[#7A1F1F]'
                }`}
              >
                {verificationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#173E2C]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#7A1F1F]" />
                )}
                <span className="font-medium">{verificationResult.message}</span>
              </div>
            )}

            {!isCompleted ? (
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 text-base"
                disabled={verifying || pinCode.length !== 4}
              >
                {verifying ? (
                  <span>Authenticating Handshake...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Handshake & Complete Job</span>
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="p-4 rounded-xl bg-[#E9EFE6] border border-[#173E2C] text-center space-y-1">
                  <p className="font-serif text-base font-bold text-[#173E2C]">
                    Job Completed & Verified!
                  </p>
                  <p className="text-xs text-[var(--ink-2)] font-mono">
                    ₦{displayJob.priceNgn.toLocaleString()} has been credited to your AEPB Collector Wallet.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-3 font-mono"
                  onClick={() => router.push('/collector/jobs')}
                >
                  <span>Return to Collector Board</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CollectorActiveJobPage() {
  return (
    <React.Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3 font-mono text-xs text-[var(--muted)]">
        <div className="w-8 h-8 border-2 border-[#173E2C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Loading Active Route...</p>
      </div>
    }>
      <ActiveJobContent />
    </React.Suspense>
  );
}
