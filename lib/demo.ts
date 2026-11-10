import { randomUUID } from 'node:crypto';
import type { Account } from './auth';
import { sampleAddress, samplePin, samplePostcode } from './demo-sample';
import { type Role, workspaces } from './roles';
import { storage, transaction } from './storage.mjs';
import type { PickupJob } from './types';

const demoLifetime = 2 * 3600_000;
const estate = 'sunrise-demo-estate';
const postcode = sampleAddress(samplePostcode)!;

function pruneExpired(now: number) {
  const db = storage();
  const accounts = `SELECT a.account_id FROM demo_accounts a JOIN demo_groups g ON g.id = a.group_id WHERE g.expires <= ?`;
  const jobs = `SELECT id FROM jobs WHERE owner_id IN (${accounts})`;
  db.prepare(`DELETE FROM report_location WHERE report_id IN (SELECT id FROM reports WHERE job_id IN (${jobs}))`).run(now);
  db.prepare(`DELETE FROM reports WHERE job_id IN (${jobs})`).run(now);
  db.prepare(`DELETE FROM booking_requests WHERE account_id IN (${accounts})`).run(now);
  db.prepare(`DELETE FROM jobs WHERE owner_id IN (${accounts})`).run(now);
  db.prepare(`DELETE FROM sessions WHERE account_id IN (${accounts})`).run(now);
  db.prepare(`DELETE FROM password_resets WHERE account_id IN (${accounts})`).run(now);
  const expired = db.prepare(accounts).all(now);
  for (const { account_id } of expired) {
    db.prepare('DELETE FROM demo_accounts WHERE account_id = ?').run(account_id);
    db.prepare('DELETE FROM accounts WHERE id = ?').run(account_id);
  }
  db.prepare('DELETE FROM demo_groups WHERE expires <= ?').run(now);
}

export function demoAccount(groupId: string, role: Role) {
  return storage().prepare(`
    SELECT a.id, a.email, a.name, a.role, a.scope, a.active, g.id AS demoGroup, g.expires AS demoExpires
    FROM demo_accounts d JOIN demo_groups g ON d.group_id = g.id JOIN accounts a ON a.id = d.account_id
    WHERE d.group_id = ? AND d.role = ? AND g.expires > ?
  `).get(groupId, role, Date.now()) as Account | undefined;
}

export function createDemo(role: Role) {
  return transaction((db) => {
    const now = Date.now();
    pruneExpired(now);
    if (Number(db.prepare('SELECT count(*) AS total FROM demo_groups').get()?.total) >= 1000) return null;

    const id = randomUUID();
    db.prepare('INSERT INTO demo_groups VALUES (?, ?)').run(id, now + demoLifetime);
    const accounts = new Map<Role, string>();
    for (const role of Object.keys(workspaces) as Role[]) {
      const accountId = randomUUID();
      const scope = role === 'municipal' ? postcode.postcode : role === 'collector' ? '' : estate;
      const profile = role === 'collector' ? JSON.stringify({
        assignedZones: [postcode.postcode], licenseNumber: 'DEMO', vehicleType: 'Mini truck',
        licensedWasteCategories: ['mixed', 'plastics', 'paper', 'metal', 'e-waste', 'organic'], isOnline: true,
      }) : null;
      db.prepare('INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?, 1, ?)')
        .run(accountId, `${accountId}@demo.invalid`, role === 'collector' ? 'Sample collector' : 'Sample ' + role, 'demo-disabled', role, scope, profile);
      db.prepare('INSERT INTO demo_accounts VALUES (?, ?, ?)').run(accountId, id, role);
      accounts.set(role, accountId);
    }

    const resident = accounts.get('resident')!;
    const collector = accounts.get('collector')!;
    const iso = (hoursAgo: number) => new Date(now - hoursAgo * 3600_000).toISOString();
    const window = 'Morning (08:00 - 11:00)';
    const seeds: Array<{ hours: number; status: PickupJob['status']; completed?: number }> = [
      { hours: -12, status: 'collector_matched' },
      { hours: 8, status: 'collector_en_route' },
      { hours: 30, status: 'verified_completed', completed: 31 },
      { hours: 54, status: 'verified_completed', completed: 52 },
      { hours: 78, status: 'verified_completed', completed: 79 },
      { hours: 102, status: 'verified_completed', completed: 103 },
    ];

    for (const [index, seed] of seeds.entries()) {
      const dueAt = iso(seed.hours);
      const completed = seed.completed !== undefined;
      const job: PickupJob = {
        id: `TRF-${randomUUID()}`, customerName: 'Sample resident', customerPhone: '', estateName: estate,
        rawAddressInput: samplePostcode, postcodeRecord: postcode, wasteCategories: ['mixed'], estimatedBags: 3,
        estimatedWeightKg: 18, scheduledDate: new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeZone: 'Africa/Lagos' }).format(new Date(dueAt)),
        pickupWindow: window, priceNgn: 4200, recyclableCreditNgn: 0, dueAt, createdAt: iso(Math.max(1, seed.hours + 10)),
        status: seed.status, receiptIssued: completed,
        collector: { id: collector, name: 'Sample collector', phone: '', vehicle: 'Mini truck', rating: 0, verifiedPickups: 0, avatarInitials: 'S' },
        verification: { gpsVerified: false, timestamp: seed.completed === undefined ? '' : iso(seed.completed), confirmationCode: samplePin, actualBags: 3 },
      };
      db.prepare('INSERT INTO jobs VALUES (?, ?, ?, ?, ?, ?, ?)').run(job.id, resident, estate, postcode.postcode, collector, job.createdAt, JSON.stringify(job));
      if (index === 1) {
        db.prepare('INSERT INTO reports (id, job_id, kind, created) VALUES (?, ?, ?, ?)').run(randomUUID(), job.id, 'overflow', iso(3));
      }
    }
    return demoAccount(id, role);
  });
}
