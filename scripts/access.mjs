import { createHash, randomBytes } from 'node:crypto';
import { storage, transaction } from '../lib/storage.mjs';

const [action, roleOrEmail, emailOrZones, scopeOrLicense, vehicle, streams] = process.argv.slice(2);
const email = (action === 'invite' ? emailOrZones : roleOrEmail)?.trim().toLowerCase();
const zones = (value) => typeof value === 'string' && value.split(',').every((zone) =>
  /^(?:[A-Z]{2}-\d{2}-[A-Z]\d{2}|\d{6})$/.test(zone));
const estate = (value) => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{1,49}$/.test(value);
const validEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

if (action === 'invite' && validEmail &&
    ((roleOrEmail === 'municipal' && zones(scopeOrLicense)) ||
     (['estate', 'resident'].includes(roleOrEmail) && estate(scopeOrLicense)))) {
  const token = randomBytes(24).toString('base64url');
  const hash = createHash('sha256').update(token).digest('hex');
  transaction((db) => {
    db.prepare('DELETE FROM invitations WHERE expires <= ? OR (email = ? AND role = ?)').run(Date.now(), email, roleOrEmail);
    db.prepare('INSERT INTO invitations VALUES (?, ?, ?, ?, ?)').run(hash, email, roleOrEmail, scopeOrLicense, Date.now() + 7 * 86400_000);
  });
  console.log(token);
} else if (action === 'approve' && validEmail && zones(emailOrZones) && scopeOrLicense && vehicle &&
    streams && streams.split(',').every((stream) => ['mixed', 'plastics', 'paper', 'metal', 'organic', 'e-waste'].includes(stream))) {
  const result = storage().prepare('UPDATE accounts SET active = 1, collector = ? WHERE email = ? AND role = ?')
    .run(JSON.stringify({
      assignedZones: [...new Set(emailOrZones.split(','))], licenseNumber: scopeOrLicense, vehicleType: vehicle,
      licensedWasteCategories: [...new Set(streams.split(','))], isOnline: false,
    }), email, 'collector');
  if (!result.changes) throw new Error('Collector account not found. Ask the collector to sign up first.');
  console.log('Collector approved. They can sign in and go available.');
} else if (action === 'reset' && validEmail) {
  const token = randomBytes(24).toString('base64url');
  const hash = createHash('sha256').update(token).digest('hex');
  const account = storage().prepare('SELECT id FROM accounts WHERE email = ?').get(email);
  if (!account) throw new Error('Account not found.');
  storage().prepare(`
    INSERT INTO password_resets VALUES (?, ?, ?)
    ON CONFLICT(account_id) DO UPDATE SET token = excluded.token, expires = excluded.expires
  `).run(account.id, hash, Date.now() + 30 * 60_000);
  console.log(token);
} else if (action === 'revoke' && validEmail) {
  transaction((db) => {
    const account = db.prepare('SELECT id FROM accounts WHERE email = ?').get(email);
    if (!account) throw new Error('Account not found.');
    db.prepare('UPDATE accounts SET active = 0 WHERE id = ?').run(account.id);
    db.prepare(`
      UPDATE jobs SET collector_id = NULL,
        data = json_remove(json_set(data, '$.status', 'requested'), '$.collector', '$.dispatchEstimate', '$.startedAt')
      WHERE collector_id = ? AND json_extract(data, '$.status') IN ('collector_matched', 'collector_en_route', 'at_location')
    `).run(account.id);
    db.prepare('DELETE FROM sessions WHERE account_id = ?').run(account.id);
    db.prepare('DELETE FROM invitations WHERE email = ?').run(email);
    db.prepare('DELETE FROM password_resets WHERE account_id = ?').run(account.id);
  });
  console.log('Access revoked.');
} else {
  console.error(`Usage:
  pnpm access invite municipal EMAIL ZONE[,ZONE]
  pnpm access invite estate EMAIL ESTATE-SLUG
  pnpm access invite resident EMAIL ESTATE-SLUG
  pnpm access approve EMAIL ZONE[,ZONE] LICENSE "VEHICLE TYPE" WASTE-TYPE[,WASTE-TYPE]
  pnpm access reset EMAIL
  pnpm access revoke EMAIL`);
  process.exitCode = 1;
}
