import { apiError, attempt, authenticate, privateJson, registerAccount, requestIdentity, resetPassword, sameOrigin, signOut, startSession } from '@/lib/auth';
import { isRole, workspaces } from '@/lib/roles';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return apiError('Invalid request origin.', 403);
  const body = await request.json().catch(() => null);
  if (body?.action === 'logout') {
    await signOut();
    return privateJson({ path: '/' });
  }

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const password = body?.password;
  const role = body?.role;
  const invitation = typeof body?.invitation === 'string' ? body.invitation.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      typeof password !== 'string' || password.length < 12 || password.length > 128) {
    return apiError('Enter a valid email and a password of 12–128 characters.', 400);
  }

  const identity = await requestIdentity();
  if (!attempt(`auth-client:${identity}`, 100, 15 * 60_000) ||
      !attempt(`auth-email:${email}`, 12, 15 * 60_000)) {
    return apiError('Too many attempts. Try again in 15 minutes.', 429);
  }

  if (body.action === 'reset') {
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (!/^[a-zA-Z0-9_-]{32}$/.test(token) || !await resetPassword(email, token, password)) {
      return apiError('The reset code is invalid, expired or already used.', 400);
    }
    return privateJson({ path: '/login' });
  }
  if (!isRole(role)) return apiError('Choose your workspace.', 400);

  if (body.action === 'register' && (name.length < 2 || name.length > 100 || invitation.length > 100)) {
    return apiError('Enter your name and check the invitation code.', 400);
  }
  if (body.action !== 'register' && body.action !== 'login') return apiError('Unknown action.', 400);

  const account = body.action === 'register'
    ? await registerAccount({ email, name, password, role, invitation })
    : await authenticate(email, password, role);

  if (!account) {
    return apiError(body.action === 'register'
      ? 'Could not create the account. Check your invitation or sign in if you already registered.'
      : 'Email, password or workspace did not match.', body.action === 'register' ? 400 : 401);
  }
  const credential = 'credential' in account && typeof account.credential === 'string' ? account.credential : undefined;
  if (!await startSession(account, credential)) return apiError('Account access changed. Sign in again.', 409);
  return privateJson({ path: account.active ? workspaces[account.role].path : '/pending' });
}
