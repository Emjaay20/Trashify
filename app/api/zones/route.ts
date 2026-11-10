import { apiAccount, privateJson } from '@/lib/auth';
import { getJobs, reports } from '@/lib/db';
import { serviceMetrics } from '@/lib/health';

export async function GET(request: Request) {
  const account = await apiAccount(request, ['estate', 'municipal']);
  if (account instanceof Response) return account;
  const days = new URL(request.url).searchParams.get('days') === '90' ? 90 : 30;
  const now = Date.now();
  const allJobs = getJobs(account);
  const byZone = new Map<string, typeof allJobs>();
  for (const job of allJobs) {
    const zone = job.postcodeRecord.postcode;
    const jobs = byZone.get(zone) ?? [];
    jobs.push(job);
    byZone.set(zone, jobs);
  }
  const periodReports = reports(account, new Date(now - days * 86_400_000).toISOString());
  const openReports = reports(account).filter((report) => !report.closedAt);

  return privateJson({
    scope: account.role === 'estate' ? account.scope : account.scope.split(',').join(', '),
    role: account.role,
    days,
    metrics: serviceMetrics(allJobs, days, now),
    zones: [...byZone.entries()].map(([code, jobs]) => ({
      code, area: jobs[0].postcodeRecord.area, ...serviceMetrics(jobs, days, now),
    })).filter((zone) => zone.due > 0),
    reports: openReports,
    reported: periodReports.length,
    closed: periodReports.filter((report) => report.closedAt).length,
  });
}
