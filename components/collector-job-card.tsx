import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { PickupJob } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CollectorJobCardProps {
  job: PickupJob;
  busy: boolean;
  onAccept: (jobId: string) => void;
}

export function CollectorJobCard({ job, onAccept, busy }: CollectorJobCardProps) {
  const isCompleted = job.status === 'verified_completed' || job.status === 'paid';
  const isMatched = job.status === 'collector_matched';
  const status = isCompleted ? 'Collected' : isMatched ? 'Assigned' : 'En route';

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[var(--muted)]">{job.id.slice(4, 12).toUpperCase()} · {status}</p>
            <h2 className="mt-1 text-lg font-semibold">{job.postcodeRecord.area}</h2>
          </div>
          <p className="text-sm font-medium text-[var(--muted)]">{job.scheduledDate} · {job.pickupWindow}</p>
        </div>
        <p className="flex items-start gap-2 text-sm">
          <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden />
          {job.postcodeRecord.standardizedAddress}
        </p>
        <p className="text-sm text-[var(--muted)]">{job.estimatedBags} bags · {job.wasteCategories.join(', ')}</p>
        <div className="border-t border-[var(--line)] pt-4">
          {isMatched ? (
            <Button type="button" size="sm" disabled={busy} onClick={() => onAccept(job.id)}>Start pickup <ArrowRight size={16} aria-hidden /></Button>
          ) : (
            <Link href={`/active/${job.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline">
              {isCompleted ? 'View collection' : 'Open pickup'} <ArrowRight size={16} aria-hidden />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
