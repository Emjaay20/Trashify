'use client';

import * as React from 'react';
import { PickupJob, CollectorProfile } from '@/lib/types';
import { CollectorJobCard } from '@/components/collector-job-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, MapPin, DollarSign, Award, Power, RefreshCw, Filter } from 'lucide-react';

export default function CollectorJobsPage() {
  const [jobs, setJobs] = React.useState<PickupJob[]>([]);
  const [isOnline, setIsOnline] = React.useState(true);
  const [selectedZone, setSelectedZone] = React.useState<string>('all');
  const [loading, setLoading] = React.useState(true);

  const fetchJobs = React.useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        if (data.jobs) {
          setJobs(data.jobs);
        }
      }
    } catch (err) {
      console.error('Failed to load collector jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleAcceptJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'collector_en_route',
          collector: {
            id: 'col-musa',
            name: 'Musa Ibrahim',
            phone: '+234 803 123 4567',
            vehicle: 'Mini Truck (1.5 Ton)',
            rating: 4.9,
            verifiedPickups: 213,
            avatarInitials: 'M'
          }
        })
      });
      if (res.ok) {
        window.location.href = `/collector/active/${jobId}`;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (selectedZone !== 'all' && job.postcodeRecord.postcode !== selectedZone) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Driver Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#173E2C] text-[#FAF8F3] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FAF8F3]/10 border border-[#FAF8F3]/20 flex items-center justify-center font-serif text-xl font-bold">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-bold">Musa Ibrahim</h1>
              <Badge variant="sage" size="sm">AEPB Licensed</Badge>
            </div>
            <p className="text-xs text-[#FAF8F3]/70 font-mono">
              Vehicle: Mini Truck (1.5 Ton) • Rating: 4.9★
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right sm:text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#FAF8F3]/70 block">
              Driver Status
            </span>
            <span className="font-mono text-xs font-semibold text-[#FAF8F3]">
              {isOnline ? 'Active on Abuja Grid' : 'Offline'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isOnline
                ? 'bg-[#E9EFE6] text-[#173E2C] hover:bg-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
          </button>
        </div>
      </div>

      {/* Driver Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border border-[var(--line)]">
          <span className="text-[10px] font-mono text-[var(--muted)] uppercase block">
            Today&apos;s Earnings
          </span>
          <span className="font-serif text-xl font-bold text-[#173E2C] mt-1 block">
            ₦38,500
          </span>
          <span className="text-[10px] text-[var(--muted)] font-mono">7 collections</span>
        </Card>

        <Card className="p-4 border border-[var(--line)]">
          <span className="text-[10px] font-mono text-[var(--muted)] uppercase block">
            Truck Capacity
          </span>
          <span className="font-serif text-xl font-bold text-[var(--ink)] mt-1 block">
            65%
          </span>
          <span className="text-[10px] text-[#7A5A12] font-mono font-medium">350kg capacity left</span>
        </Card>

        <Card className="p-4 border border-[var(--line)]">
          <span className="text-[10px] font-mono text-[var(--muted)] uppercase block">
            Assigned Zones
          </span>
          <span className="font-mono text-sm font-bold text-[var(--ink)] mt-1 block">
            900211, 900271
          </span>
          <span className="text-[10px] text-[var(--muted)] font-mono">Wuse 2 & Maitama</span>
        </Card>

        <Card className="p-4 border border-[var(--line)]">
          <span className="text-[10px] font-mono text-[var(--muted)] uppercase block">
            SLA Rating
          </span>
          <span className="font-serif text-xl font-bold text-[#173E2C] mt-1 block">
            98.5%
          </span>
          <span className="text-[10px] text-[var(--muted)] font-mono">212 handshakes verified</span>
        </Card>
      </div>

      {/* Filter / Zone Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-mono text-[var(--muted)] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Zone:
          </span>
          {['all', '900211', '900271', '900001', '900231'].map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedZone === zone
                  ? 'bg-[#173E2C] text-[#FAF8F3] font-medium'
                  : 'bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--surface-3)]'
              }`}
            >
              {zone === 'all' ? 'All Assigned' : `Postcode ${zone}`}
            </button>
          ))}
        </div>

        <button
          onClick={fetchJobs}
          className="inline-flex items-center gap-1 text-xs font-mono text-[var(--muted)] hover:text-[var(--ink)] self-end sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Available Jobs Queue */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
          Active & Available Dispatches ({filteredJobs.length})
        </h2>

        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-[var(--line)] rounded-2xl bg-[var(--surface-2)]/30 space-y-2">
            <Truck className="w-8 h-8 text-[var(--muted)] mx-auto" />
            <p className="text-sm font-semibold text-[var(--ink)]">No pickups in this zone right now</p>
            <p className="text-xs text-[var(--muted)]">New customer bookings in Postcode {selectedZone} will notify you automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <CollectorJobCard
                key={job.id}
                job={job}
                onAccept={handleAcceptJob}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
