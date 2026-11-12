import { apiAccount, apiError, attempt, privateJson } from '@/lib/auth';
import { suggestReport } from '@/lib/ai';

export async function POST(request: Request) {
  const account = await apiAccount(request, ['resident']);
  if (account instanceof Response) return account;
  const body = await request.json().catch(() => null);
  if (typeof body?.text !== 'string' || body.text.length > 1000 || !body.text.trim()) return apiError('Describe the issue in up to 1,000 characters.', 400);
  if (!attempt(`ai-report:${account.id}`, 20, 3600_000)) return apiError('Choose an issue type manually for now.', 429);
  return privateJson(await suggestReport(body.text));
}
