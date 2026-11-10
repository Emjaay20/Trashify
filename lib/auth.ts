import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { type Role, workspaces } from './roles';
import { storage, transaction } from './storage.mjs';

const deriveKey = promisify(scrypt);
const cookieName = 'trashify_session';
const lifetime = 60 * 60 * 24 * 7;

export type Account = { id: string; email: string; name: string; role: Role; scope: string; active: number; demoGroup?: string | null; demoExpires?: number | null };
type AccountRow = Account & { password: string };

function digest(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function attempt(key: string, limit: number, intervalMs: number) {
  const now = Date.now();
  const db = storage();
  db.prepare('DELETE FROM throttle WHERE expires <= ?').run(now);
  const row = db.prepare(`
    INSERT INTO throttle (key, attempts, expires) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET attempts = min(attempts + 1, ?)
    RETURNING attempts
  `).get(digest(key), now + intervalMs, limit + 1);
  return Number(row?.attempts) <= limit;
}

export async function requestIdentity() {
  const values = await headers();
  const proxyHeader = process.env.TRASHIFY_CLIENT_IP_HEADER;
  return proxyHeader ? values.get(proxyHeader)?.split(',').at(-1)?.trim() || 'unknown' : 'direct';
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = (await deriveKey(password, salt, 64) as Buffer).toString('hex');
  return `${salt}:${hash}`;
}

export async function resetPassword(email: string, token: string, password: string) {
  const tokenHash = digest(token);
  const db = storage();
  const account = db.prepare(`
    SELECT a.id FROM password_resets p JOIN accounts a ON p.account_id = a.id
    WHERE a.email = ? AND p.token = ? AND p.expires > ?
  `).get(email, tokenHash, Date.now());
  if (!account) return false;
  const passwordHash = await hashPassword(password);
  return transaction((db) => {
    const deleted = db.prepare('DELETE FROM password_resets WHERE account_id = ? AND token = ? AND expires > ?')
      .run(String(account.id), tokenHash, Date.now());
    if (!deleted.changes) return false;
    db.prepare('UPDATE accounts SET password = ? WHERE id = ?').run(passwordHash, String(account.id));
    db.prepare('DELETE FROM sessions WHERE account_id = ?').run(String(account.id));
    return true;
  });
}

export async function registerAccount(input: {
  email: string; name: string; password: string; role: Role; invitation: string;
}) {
  const passwordHash = await hashPassword(input.password);
  return transaction((db) => {
    const token = input.invitation ? digest(input.invitation) : '';
    const invite = token ? db.prepare('SELECT scope FROM invitations WHERE token = ? AND email = ? AND role = ? AND expires > ?')
      .get(token, input.email, input.role, Date.now()) : undefined;
    if ((token && !invite) || (['estate', 'municipal'].includes(input.role) && !invite)) return null;
    const account: Account = {
      id: randomUUID(), email: input.email, name: input.name, role: input.role,
      scope: String(invite?.scope ?? ''), active: input.role === 'collector' ? 0 : 1,
    };
    const inserted = db.prepare(`
      INSERT INTO accounts (id, email, name, password, role, scope, active)
      VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING
    `).run(account.id, account.email, account.name, passwordHash, account.role, account.scope, account.active);
    if (!inserted.changes) return null;
    if (token) db.prepare('DELETE FROM invitations WHERE token = ?').run(token);
    return account;
  });
}

export async function authenticate(email: string, password: string, role: Role) {
  const row = storage().prepare('SELECT id, email, name, role, scope, active, password FROM accounts WHERE email = ? AND role = ? AND id NOT IN (SELECT account_id FROM demo_accounts)')
    .get(email, role) as AccountRow | undefined;
  const [salt, hash] = row?.password.split(':') ?? ['trashify-dummy-salt', '00'.repeat(64)];
  const key = await deriveKey(password, salt, 64) as Buffer;
  if (!timingSafeEqual(key, Buffer.from(hash, 'hex')) || !row) return null;
  const { id, name, scope, active } = row;
  return { id, name, email, scope, active, role, credential: row.password };
}

export async function currentAccount() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return (storage().prepare(`
    SELECT a.id, a.email, a.name, a.role, a.scope, a.active, d.group_id AS demoGroup, g.expires AS demoExpires
    FROM sessions s JOIN accounts a ON s.account_id = a.id
    LEFT JOIN demo_accounts d ON d.account_id = a.id LEFT JOIN demo_groups g ON g.id = d.group_id
    WHERE s.token = ? AND s.expires > ? AND (d.account_id IS NULL OR g.expires > ?)
  `).get(digest(token), Date.now(), Date.now()) as Account | undefined) ?? null;
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) storage().prepare('DELETE FROM sessions WHERE token = ?').run(digest(token));
  jar.delete(cookieName);
}

export async function startSession(account: Account, expectedCredential?: string) {
  const jar = await cookies();
  const previous = jar.get(cookieName)?.value;
  const token = randomBytes(32).toString('hex');
  const expires = account.demoExpires ?? Date.now() + lifetime * 1000;
  if (expires <= Date.now()) return false;
  const inserted = transaction((db) => {
    const row = db.prepare('SELECT password, active FROM accounts WHERE id = ?').get(account.id);
    if (!row || row.active !== account.active || (expectedCredential && row.password !== expectedCredential)) return false;
    db.prepare('DELETE FROM sessions WHERE expires <= ? OR token = ?').run(Date.now(), previous ? digest(previous) : '');
    db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(digest(token), account.id, expires);
    return true;
  });
  if (!inserted) return false;
  jar.set(cookieName, token, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: Math.ceil((expires - Date.now()) / 1000),
    secure: process.env.NODE_ENV === 'production',
  });
  return true;
}

export async function requireWorkspace(roles: readonly Role[]) {
  const account = await currentAccount();
  if (!account) redirect(`/login?role=${roles[0]}`);
  if (!account.active) redirect('/pending');
  if (!roles.includes(account.role)) redirect(workspaces[account.role].path);
  return account;
}

export function apiError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

export function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = process.env.TRASHIFY_ORIGIN || new URL(request.url).origin;
  return origin === expected;
}

export async function apiAccount(request: Request, roles: readonly Role[]) {
  if (request.method !== 'GET' && !sameOrigin(request)) return apiError('Invalid request origin.', 403);
  const account = await currentAccount();
  if (!account) return apiError('Sign in to continue.', 401);
  if (!account.active || !roles.includes(account.role)) return apiError('This workspace does not have access.', 403);
  return account;
}
