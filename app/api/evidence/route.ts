import { apiAccount, apiError, attempt, privateJson } from '@/lib/auth';
import { completePickup, getJobById, visibleJob } from '@/lib/db';
import type { FieldEvidencePayload } from '@/lib/types';

export async function POST(request: Request) {
  const account = await apiAccount(request, ['collector']);
  if (account instanceof Response) return account;
  const payload = await request.json().catch(() => null) as (FieldEvidencePayload & { simulateDemoLocation?: boolean }) | null;
  if (typeof payload?.jobId !== 'string' || typeof payload.customerConfirmationCode !== 'string' ||
      !/^\d{4}$/.test(payload.customerConfirmationCode)) {
    return apiError('A pickup ID and four-digit PIN are required.', 400);
  }
  const job = getJobById(account, payload.jobId);
  if (!job) return apiError('Pickup not found.', 404);
  if (job.status !== 'verified_completed' && !attempt(`pickup-pin:${job.id}`, 10, 15 * 60_000)) {
    return apiError('Too many attempts. Try again in 15 minutes.', 429);
  }
  if (payload.simulateDemoLocation && !account.demoGroup) return apiError('A device location is required.', 422);
  const result = completePickup(account, payload, payload.simulateDemoLocation === true);
  if (!result.job) return apiError(result.error, result.status);
  return privateJson({ verified: true, message: 'Pickup recorded.', job: visibleJob(account, result.job) });
}
