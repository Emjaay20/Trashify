'use client';

import * as React from 'react';
import { PickupJob } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, ArrowRight, ShieldCheck, CheckCircle2, Phone, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CollectorJobCardProps {
  job: PickupJob;
  onAccept?: (jobId: string) => void;
  onNavigate?: (jobId: string) => void;
  className?: string;
}

export function CollectorJobCard({ job, onAccept, onNavigate, className }: CollectorJobCardProps) {
  const isEnRoute = job.status === 'collector_en_route';
  const isCompleted = job.status === 'verified_completed' || job.status === 'paid';
  const isAvailable = job.status === 'requested' || job.status === 'address_verified';

  return (
    <Card className={`overflow-hidden border border-[var(--line)] hover:border-[#173E2C]/40 transition-all ${className || ''}`}>
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-[var(--ink)]">
                {job.id}
              </span>
              <Badge variant="forest" size="sm">
                Postcode {job.postcodeRecord.postcode}
              </Badge>
              {job.postcodeRecord.coordinates?.tierLevel && (
                <Badge variant="neutral" size="sm">
                  Tier {job.postcodeRecord.coordinates.tierLevel}
                </Badge>
              )}
            </div>
            <h3 className="font-serif text-base font-semibold text-[var(--ink)] mt-1">
              {job.postcodeRecord.area} • {job.estateName || 'Urban Ward'}
            </h3>
          </div>

          <div className="text-right">
            <span className="font-serif text-lg font-bold text-[#173E2C]">
              ₦{job.priceNgn.toLocaleString()}
            </span>
            <p className="text-[10px] font-mono text-[var(--muted)]">Payout</p>
          </div>
        </div>

        {/* Address and Landmark */}
        <div className="bg-[var(--surface-2)]/60 p-3 rounded-lg text-xs space-y-1 border border-[var(--line)]">
          <div className="flex items-start gap-1.5 text-[var(--ink-2)]">
            <MapPin className="w-3.5 h-3.5 text-[#173E2C] shrink-0 mt-0.5" />
            <span className="font-medium">{job.postcodeRecord.standardizedAddress}</span>
          </div>
          {job.postcodeRecord.landmarkMatch && (
            <p className="text-[11px] text-[var(--muted)] pl-5">
              Landmark: {job.postcodeRecord.landmarkMatch}
            </p>
          )}
        </div>

        {/* Waste Details & Dispatch Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-[var(--surface-2)]/40 border border-[var(--line)]">
            <span className="text-[10px] text-[var(--muted)] block">LOAD</span>
            <span className="font-semibold text-[var(--ink)]">{job.estimatedBags} bags (~{job.estimatedWeightKg}kg)</span>
          </div>
          <div className="p-2 rounded bg-[var(--surface-2)]/40 border border-[var(--line)]">
            <span className="text-[10px] text-[var(--muted)] block">CATEGORY</span>
            <span className="font-semibold capitalize text-[var(--ink)]">
              {job.wasteCategories.join(', ')}
            </span>
          </div>
          <div className="p-2 rounded bg-[var(--surface-2)]/40 border border-[var(--line)] col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[var(--muted)] block">EST. DRIVE</span>
            <span className="font-semibold text-[#173E2C] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {job.dispatchEstimate?.etaMinutes || 15} mins ({job.dispatchEstimate?.distanceKm || 3.2} km)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between gap-2">
          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-xs text-[#173E2C] font-mono font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#173E2C]" />
              <span>Verified & Paid</span>
            </div>
          ) : isEnRoute ? (
            <>
              <div className="flex items-center gap-1.5 text-xs text-[#7A5A12] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#9A7E4A] animate-ping" />
                <span>En Route to Pickup</span>
              </div>
              <Link href={`/collector/active/${job.id}`}>
                <Button variant="primary" size="sm">
                  <span>Enter PIN / Verify</span>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          ) : isAvailable ? (
            <>
              <span className="text-xs text-[var(--muted)] font-mono">
                Window: {job.pickupWindow}
              </span>
              <div className="flex items-center gap-2">
                {onAccept ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAccept(job.id)}
                  >
                    <span>Accept Job</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <Link href={`/collector/active/${job.id}`}>
                    <Button variant="primary" size="sm">
                      <span>Accept & Navigate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </>
          ) : (
            <Link href={`/collector/active/${job.id}`} className="w-full">
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span>View Job Details & Handshake</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
