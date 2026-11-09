'use client';

import * as React from 'react';
import Link from 'next/link';
import { PickupJob, MunicipalZoneStats } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Activity, 
  Truck, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  MapPin,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [jobs, setJobs] = React.useState<PickupJob[]>([]);
  const [zones, setZones] = React.useState<MunicipalZoneStats[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      const [jobsRes, zonesRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/zones')
      ]);

      if (jobsRes.ok) {
        const jData = await jobsRes.json();
        if (jData.jobs) setJobs(jData.jobs);
      }
      if (zonesRes.ok) {
        const zData = await zonesRes.json();
        if (zData.zones) setZones(zData.zones);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregate stats
  const totalBags = jobs.reduce((acc, j) => acc + (j.estimatedBags || 0), 0);
  const totalKg = jobs.reduce((acc, j) => acc + (j.estimatedWeightKg || 0), 0);
  const verifiedCount = jobs.filter(j => j.status === 'verified_completed' || j.status === 'paid').length;
  const inProgressCount = jobs.filter(j => j.status === 'collector_en_route' || j.status === 'collector_matched').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="forest">AMAC Municipal Console</Badge>
            <span className="text-xs font-mono text-[var(--muted)]">Live Postal Dispatch Oversight</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[var(--ink)] mt-1">
            Abuja Waste Operations & SLA Command
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Powered by NIPOST 6-Digit Digital Postcodes & ResolveGrid spatial verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/zones">
            <Button variant="outline" size="sm">
              <Layers className="w-3.5 h-3.5" />
              <span>Zone Allocations</span>
            </Button>
          </Link>
          <button
            onClick={fetchData}
            className="px-3 py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-mono border border-[var(--line)] flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#173E2C]" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-[var(--line)]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
            Total Diverted Today
          </span>
          <span className="font-serif text-2xl font-bold text-[#173E2C] mt-1 block">
            {(totalKg / 1000).toFixed(2)} Tons
          </span>
          <span className="text-[10px] text-[var(--muted)] font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#173E2C]" /> 18.4% diverted to recyclers
          </span>
        </Card>

        <Card className="p-4 border border-[var(--line)]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
            SLA Handshake Compliance
          </span>
          <span className="font-serif text-2xl font-bold text-[#173E2C] mt-1 block">
            97.8%
          </span>
          <span className="text-[10px] text-[var(--muted)] font-mono">
            {verifiedCount} verified with GPS & PIN
          </span>
        </Card>

        <Card className="p-4 border border-[var(--line)]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
            Active Dispatches
          </span>
          <span className="font-serif text-2xl font-bold text-[var(--ink)] mt-1 block">
            {inProgressCount} En Route
          </span>
          <span className="text-[10px] text-[#7A5A12] font-mono">
            Average ETA: 16.4 mins
          </span>
        </Card>

        <Card className="p-4 border border-[var(--line)]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
            NIPOST Geocoding Accuracy
          </span>
          <span className="font-serif text-2xl font-bold text-[#173E2C] mt-1 block">
            91.4%
          </span>
          <span className="text-[10px] text-[var(--muted)] font-mono">
            Tier 4 & Tier 5 resolution
          </span>
        </Card>
      </div>

      {/* Municipal Zone Performance Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
              Abuja Metropolitan Postcode Zone Performance
            </h2>
            <Badge variant="sage" size="sm">5 Pilot Zones</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                  <th className="pb-3 font-semibold">Postcode</th>
                  <th className="pb-3 font-semibold">Area / LGA</th>
                  <th className="pb-3 font-semibold">Active Trucks</th>
                  <th className="pb-3 font-semibold">Pickups Today</th>
                  <th className="pb-3 font-semibold">Tonnage</th>
                  <th className="pb-3 font-semibold">ResolveGrid Match</th>
                  <th className="pb-3 font-semibold text-right">SLA Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {zones.map((zone) => (
                  <tr key={zone.postcode} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="py-3 font-bold text-[#173E2C]">#{zone.postcode}</td>
                    <td className="py-3 text-[var(--ink)]">{zone.area}, {zone.lga}</td>
                    <td className="py-3">{zone.activeCollectors} collectors</td>
                    <td className="py-3">{zone.pickupsToday} jobs</td>
                    <td className="py-3">{zone.tonsCollected} tons</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#E9EFE6] text-[#173E2C] font-semibold">
                        {Math.round(zone.avgConfidence * 100)}%
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-[#173E2C]">
                      {zone.slaCompliancePercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Live Job Ledger */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[var(--ink)]">
              Real-Time Dispatch Ledger ({jobs.length} total)
            </h2>
            <span className="text-xs font-mono text-[var(--muted)]">Cryptographic NDPA Audit Trail</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                  <th className="pb-3 font-semibold">Job ID</th>
                  <th className="pb-3 font-semibold">Customer / Landmark</th>
                  <th className="pb-3 font-semibold">Postcode</th>
                  <th className="pb-3 font-semibold">Collector</th>
                  <th className="pb-3 font-semibold">Bags</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="py-3 font-bold text-[var(--ink)]">{job.id}</td>
                    <td className="py-3 text-[var(--ink-2)] max-w-xs truncate">
                      <span className="font-semibold block">{job.customerName}</span>
                      <span className="text-[11px] text-[var(--muted)] truncate block">{job.postcodeRecord.standardizedAddress}</span>
                    </td>
                    <td className="py-3">
                      <Badge variant="forest" size="sm">#{job.postcodeRecord.postcode}</Badge>
                    </td>
                    <td className="py-3 text-[var(--ink-2)]">
                      {job.collector?.name || 'Unassigned'}
                    </td>
                    <td className="py-3">{job.estimatedBags} bags</td>
                    <td className="py-3 font-semibold text-[#173E2C]">₦{job.priceNgn.toLocaleString()}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          job.status === 'verified_completed'
                            ? 'sage'
                            : job.status === 'collector_en_route'
                            ? 'amber'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/customer/track/${job.id}`}
                        className="text-[#173E2C] hover:underline font-semibold"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
