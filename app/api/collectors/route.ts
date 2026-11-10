import { apiAccount, apiError, privateJson } from '@/lib/auth';
import { isCollectorAvailable, setCollectorAvailability } from '@/lib/db';

export async function GET(request: Request) {
  const account = await apiAccount(request, ['collector']);
  if (account instanceof Response) return account;
  return privateJson({ available: isCollectorAvailable(account) });
}

export async function PATCH(request: Request) {
  const account = await apiAccount(request, ['collector']);
  if (account instanceof Response) return account;
  const body = await request.json().catch(() => null);
  if (typeof body?.available !== 'boolean') return apiError('Choose an availability status.', 400);
  return setCollectorAvailability(account, body.available)
    ? privateJson({ available: body.available })
    : apiError('Collector approval is required.', 403);
}
