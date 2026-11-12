import { apiAccount, apiError, attempt, privateJson } from '@/lib/auth';
import { summarizePeriod } from '@/lib/ai';
import { getJobs, reports } from '@/lib/db';
import { serviceMetrics } from '@/lib/health';

export async function POST(request: Request) {
  const account = await apiAccount(request, ['estate', 'municipal']);
  if (account instanceof Response) return account;
  if (!attempt(`ai-summary:${account.id}`, 20, 3600_000)) return apiError('Try the dashboard figures for now.', 429);
  const body = await request.json().catch(() => null);
  const days = body?.days === 90 ? 90 : 30;
  const jobs = getJobs(account);
  const open = reports(account).filter((report) => !report.closedAt);
  const districts = [...new Set([...jobs.map((job) => job.postcodeRecord.postcode), ...open.map((report) => report.zone)])];
  const aggregates = districts.map((district) => ({ district,
    ...serviceMetrics(jobs.filter((job) => job.postcodeRecord.postcode === district), days),
    openReports: open.filter((report) => report.zone === district).length,
  }));
  return privateJson(await summarizePeriod(days, aggregates));
}
