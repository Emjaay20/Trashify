import { apiAccount, apiError, privateJson } from '@/lib/auth';
import { getJobById, startPickup, visibleJob } from '@/lib/db';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const account = await apiAccount(request, ['resident', 'collector', 'estate', 'municipal']);
  if (account instanceof Response) return account;
  const job = getJobById(account, (await context.params).id);
  return job ? privateJson({ job: visibleJob(account, job) }) : apiError('Pickup not found.', 404);
}

export async function PATCH(request: Request, context: Context) {
  const account = await apiAccount(request, ['collector']);
  if (account instanceof Response) return account;
  const id = (await context.params).id;
  if (!getJobById(account, id)) return apiError('Pickup not found.', 404);
  const job = startPickup(account, id);
  return job ? privateJson({ job: visibleJob(account, job) }) : apiError('This pickup cannot be started.', 409);
}
