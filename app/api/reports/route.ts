import { apiAccount, apiError, privateJson } from '@/lib/auth';
import { closeReport, fileReport, reports } from '@/lib/db';
import { isReportKind } from '@/lib/pickup-policy';

export async function GET(request: Request) {
  const account = await apiAccount(request, ['resident', 'estate', 'municipal']);
  if (account instanceof Response) return account;
  const jobId = new URL(request.url).searchParams.get('jobId');
  if (account.role === 'resident' && !jobId) return apiError('Choose a pickup.', 400);
  return privateJson({ reports: reports(account, undefined, jobId ?? undefined) });
}

export async function POST(request: Request) {
  const account = await apiAccount(request, ['resident']);
  if (account instanceof Response) return account;
  const body = await request.json().catch(() => null);
  if (typeof body?.jobId !== 'string' || !isReportKind(body.kind)) return apiError('Choose a pickup and issue type.', 400);
  const result = fileReport(account, body.jobId, body.kind, body.shareAddress === true);
  if (result === 'missing') return apiError('Pickup not found.', 404);
  if (result === 'early') return apiError('A missed pickup can be reported after its window ends.', 422);
  return privateJson({ reports: reports(account, undefined, body.jobId) });
}

export async function PATCH(request: Request) {
  const account = await apiAccount(request, ['estate', 'municipal']);
  if (account instanceof Response) return account;
  const body = await request.json().catch(() => null);
  if (typeof body?.id !== 'string') return apiError('Choose a report.', 400);
  return closeReport(account, body.id) ? privateJson({ resolved: true }) : apiError('Open report not found.', 404);
}
