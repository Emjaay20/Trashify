import { apiAccount } from '@/lib/auth';
import { getJobs } from '@/lib/db';
import { serviceMetrics } from '@/lib/health';
import { isServiceZone } from '@/lib/pickup-policy';

export async function GET(request: Request) {
  const account = await apiAccount(request, ['estate', 'municipal']);
  if (account instanceof Response) return account;
  const days = new URL(request.url).searchParams.get('days') === '90' ? 90 : 30;
  const now = Date.now();
  const jobs = getJobs(account);
  const zones = [...new Set(jobs.map((job) => job.postcodeRecord.postcode))].sort();
  const lines = ['period_days,period_end_utc,postcode_district,due,collected,on_time,still_overdue,median_hours_to_collect'];
  for (const zone of zones) {
    if (!isServiceZone(zone)) continue;
    const metric = serviceMetrics(jobs.filter((job) => job.postcodeRecord.postcode === zone), days, now);
    if (metric.due < 5) continue;
    lines.push([days, new Date(now).toISOString(), zone, metric.due, metric.completed, metric.onTime,
      metric.overdue, metric.completed >= 5 ? metric.medianHours ?? '' : ''].join(','));
  }
  return new Response(lines.join('\r\n') + '\r\n', {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="trashify-service-metrics.csv"',
    },
  });
}
