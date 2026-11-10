import { apiError, attempt, currentAccount, privateJson, requestIdentity, sameOrigin, startSession } from '@/lib/auth';
import { createDemo, demoAccount } from '@/lib/demo';
import { isRole, workspaces } from '@/lib/roles';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiError('Invalid request origin.', 403);
  const body = await request.json().catch(() => null);
  if (!isRole(body?.role)) return apiError('Choose a demo workspace.', 400);
  const current = await currentAccount();
  if (current && !current.demoGroup) return apiError('Sign out of your account before starting the demo.', 409);
  if (!current && !attempt(`demo:${await requestIdentity()}`, 100, 3600_000)) {
    return apiError('Demo capacity is temporarily limited. Try again later.', 429);
  }
  const account = current?.demoGroup ? demoAccount(current.demoGroup, body.role) : createDemo(body.role);
  if (!account || !await startSession(account)) return apiError('Could not open the demo. Try again shortly.', 503);
  return privateJson({ path: workspaces[account.role].path });
}
