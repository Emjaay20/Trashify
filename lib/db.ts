import { randomInt, randomUUID } from 'node:crypto';
import type { SQLInputValue } from 'node:sqlite';
import type { Account } from './auth';
import { autoAssignCollector } from './matching';
import { isServiceZone, type ReportKind } from './pickup-policy';
import { storage, transaction } from './storage.mjs';
import type { CollectorProfile, FieldEvidencePayload, PickupJob } from './types';

type JobRow = { id: string; owner_id: string; estate: string; zone: string; collector_id: string | null; data: string };
type ReportRow = { id: string; job_id: string; kind: ReportKind; created: string; closed: string | null; zone: string; data: string; share_address: string | null };

// Live owners have no demo membership. Scope every job read and assignment to the same namespace.
const ownerNamespace = `(SELECT group_id FROM demo_accounts WHERE account_id = j.owner_id) IS ?`;

export function jobScope(account: Account): [string, ...SQLInputValue[]] {
  const namespace = account.demoGroup ?? null;
  switch (account.role) {
    case 'resident': return [`${ownerNamespace} AND j.owner_id = ?`, namespace, account.id];
    case 'collector': return [`${ownerNamespace} AND j.collector_id = ?`, namespace, account.id];
    case 'estate': return [`${ownerNamespace} AND j.estate = ? AND j.estate <> ''`, namespace, account.scope];
    case 'municipal': {
      const zones = account.scope.split(',').filter(isServiceZone);
      return zones.length ? [`${ownerNamespace} AND j.zone IN (${zones.map(() => '?').join(', ')})`, namespace, ...zones] : ['0'];
    }
  }
}

function readJob(row: JobRow) {
  return JSON.parse(row.data) as PickupJob;
}

export function visibleJob(account: Account, job: PickupJob) {
  const { customerPhone, rawAddressInput, verification, ...remaining } = job;
  const staff = account.role === 'estate' || account.role === 'municipal';
  const publicVerification = verification && {
    gpsVerified: verification.gpsVerified, timestamp: verification.timestamp, actualBags: verification.actualBags,
  };
  if (staff) {
    return {
      id: job.id, status: job.status, zone: job.postcodeRecord.postcode, area: job.postcodeRecord.area,
      createdAt: job.createdAt, dueAt: job.dueAt, completedAt: verification?.timestamp || null,
    };
  }
  return {
    ...remaining,
    demo: Boolean(account.demoGroup),
    rawAddressInput,
    customerPhone: account.role === 'collector' && job.status === 'verified_completed' ? '' : customerPhone,
    verification: account.role === 'resident' ? verification : publicVerification,
    canReportMissed: account.role === 'resident' ? canReportMissed(job) : undefined,
  };
}

export function getJobs(account: Account) {
  const [scope, ...values] = jobScope(account);
  return (storage().prepare(`SELECT j.* FROM jobs j WHERE ${scope} ORDER BY j.created DESC`).all(...values) as JobRow[]).map(readJob);
}

export function getJobById(account: Account, id: string) {
  const [scope, ...values] = jobScope(account);
  const row = storage().prepare(`SELECT j.* FROM jobs j WHERE j.id = ? AND ${scope}`).get(id, ...values) as JobRow | undefined;
  return row ? readJob(row) : undefined;
}

function collectors(namespace: string | null) {
  const db = storage();
  const reserved = db.prepare(`
    SELECT collector_id, SUM(json_extract(data, '$.estimatedWeightKg')) AS kg
    FROM jobs WHERE collector_id IS NOT NULL AND json_extract(data, '$.status') IN ('collector_matched', 'collector_en_route', 'at_location')
    GROUP BY collector_id
  `).all();
  const loads = new Map(reserved.map((row) => [row.collector_id, Number(row.kg)]));
  return db.prepare(`
    SELECT a.id, a.name, a.collector FROM accounts a LEFT JOIN demo_accounts d ON d.account_id = a.id
    WHERE a.role = 'collector' AND a.active = 1 AND a.collector IS NOT NULL AND d.group_id IS ?
  `).all(namespace).map((row) => ({
      ...JSON.parse(String(row.collector)),
      id: String(row.id), name: String(row.name), phone: '',
      capacityUsedPercent: (loads.get(row.id) || 0) / 15,
      rating: 0, completedThisWeek: 0, earningsThisWeekNgn: 0,
    }) as CollectorProfile);
}

type NewJob = Pick<PickupJob, 'customerPhone' | 'rawAddressInput' | 'postcodeRecord' | 'wasteCategories' |
  'estimatedBags' | 'scheduledDate' | 'pickupWindow' | 'priceNgn' | 'recyclableCreditNgn' | 'dueAt'>;

export function findBookingRequest(account: Account, requestId: string) {
  const row = storage().prepare(`
    SELECT j.* FROM jobs j JOIN booking_requests b ON j.id = b.job_id
    WHERE b.account_id = ? AND b.request_id = ?
  `).get(account.id, requestId) as JobRow | undefined;
  return row ? readJob(row) : undefined;
}

export function createJob(account: Account, input: NewJob, requestId: string) {
  return transaction((db) => {
    const active = db.prepare("SELECT active FROM accounts WHERE id = ? AND role = 'resident'").get(account.id);
    if (active?.active !== 1) return null;
    const existing = findBookingRequest(account, requestId);
    if (existing) return existing;
    const job = autoAssignCollector({
      ...input,
      id: `TRF-${randomUUID()}`,
      customerName: account.name,
      estateName: account.scope || undefined,
      estimatedWeightKg: input.estimatedBags * 6,
      status: 'requested',
      verification: {
        gpsVerified: false, timestamp: '', confirmationCode: randomInt(0, 10_000).toString().padStart(4, '0'),
        actualBags: input.estimatedBags,
      },
      createdAt: new Date().toISOString(),
      receiptIssued: false,
    }, collectors(account.demoGroup ?? null));
    db.prepare('INSERT INTO jobs VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(job.id, account.id, account.scope, job.postcodeRecord.postcode, job.collector?.id ?? null, job.createdAt, JSON.stringify(job));
    db.prepare('INSERT INTO booking_requests VALUES (?, ?, ?)').run(account.id, requestId, job.id);
    return job;
  });
}

export function setCollectorAvailability(account: Account, available: boolean) {
  return transaction((db) => {
    const row = db.prepare('SELECT collector FROM accounts WHERE id = ? AND active = 1').get(account.id);
    if (!row?.collector) return false;
    db.prepare('UPDATE accounts SET collector = ? WHERE id = ?').run(
      JSON.stringify({ ...JSON.parse(String(row.collector)), isOnline: available }), account.id);
    if (available) {
      const pending = db.prepare(`
        SELECT j.* FROM jobs j WHERE ${ownerNamespace} AND j.collector_id IS NULL
        AND json_extract(j.data, '$.status') = 'requested' ORDER BY j.created
      `).all(account.demoGroup ?? null) as JobRow[];
      for (const row of pending) {
        const assigned = autoAssignCollector(readJob(row), collectors(account.demoGroup ?? null));
        if (assigned.collector) {
          db.prepare('UPDATE jobs SET collector_id = ?, data = ? WHERE id = ?')
            .run(assigned.collector.id, JSON.stringify(assigned), assigned.id);
        }
      }
    }
    return true;
  });
}

export function isCollectorAvailable(account: Account) {
  const row = storage().prepare('SELECT collector FROM accounts WHERE id = ?').get(account.id);
  return Boolean(row?.collector && JSON.parse(String(row.collector)).isOnline);
}

export function startPickup(account: Account, id: string) {
  return transaction((db) => {
    const job = getJobById(account, id);
    if (!job || !['collector_matched', 'collector_en_route'].includes(job.status)) return null;
    job.status = 'collector_en_route';
    job.startedAt ??= new Date().toISOString();
    db.prepare('UPDATE jobs SET data = ? WHERE id = ?').run(JSON.stringify(job), id);
    return job;
  });
}

export function completePickup(account: Account, payload: FieldEvidencePayload, simulateLocation = false) {
  return transaction((db) => {
    const job = getJobById(account, payload.jobId);
    if (!job) return { error: 'Pickup not found.', status: 404 };
    if (job.status === 'verified_completed') return { job };
    if (!job.verification?.confirmationCode || payload.customerConfirmationCode !== job.verification.confirmationCode) {
      return { error: 'The resident’s pickup PIN does not match.', status: 422 };
    }
    if (job.status !== 'collector_en_route' && job.status !== 'at_location') {
      return { error: 'Start the pickup before completing it.', status: 409 };
    }

    const target = job.postcodeRecord.coordinates;
    const simulated = Boolean(account.demoGroup && simulateLocation);
    const location = simulated && target ? { lat: target.lat, lng: target.lng, accuracyMeters: 1 } : payload.gpsLocation;
    if (!target || !location || !Number.isFinite(location.lat) || Math.abs(location.lat) > 90 ||
        !Number.isFinite(location.lng) || Math.abs(location.lng) > 180 ||
        typeof location.accuracyMeters !== 'number' || !Number.isFinite(location.accuracyMeters) ||
        location.accuracyMeters <= 0 || location.accuracyMeters > 100) {
      return { error: 'A device location accurate to 100 metres or better is required.', status: 422 };
    }
    const radians = Math.PI / 180;
    const a = Math.sin((location.lat - target.lat) * radians / 2) ** 2 +
      Math.cos(target.lat * radians) * Math.cos(location.lat * radians) *
      Math.sin((location.lng - target.lng) * radians / 2) ** 2;
    const distanceMetres = 12_742_000 * Math.asin(Math.sqrt(Math.min(1, a)));
    if (distanceMetres > 150) return { error: 'Your device is more than 150 metres from the pickup location.', status: 422 };

    job.status = 'verified_completed';
    job.verification.gpsVerified = !simulated;
    job.verification.timestamp = new Date().toISOString();
    job.receiptIssued = true;
    db.prepare('UPDATE jobs SET data = ? WHERE id = ?').run(JSON.stringify(job), job.id);
    return { job };
  });
}

export function canReportMissed(job: PickupJob) {
  const due = Date.parse(job.dueAt ?? '');
  const completed = Date.parse(job.verification?.timestamp ?? '');
  return Number.isFinite(due) && due <= Date.now() && !(completed <= due);
}

export function fileReport(account: Account, jobId: string, kind: ReportKind, shareAddress: boolean) {
  return transaction((db) => {
    const job = getJobById(account, jobId);
    if (!job) return 'missing';
    if (kind === 'missed' && !canReportMissed(job)) return 'early';
    const id = randomUUID();
    const inserted = db.prepare('INSERT INTO reports (id, job_id, kind, created) VALUES (?, ?, ?, ?) ON CONFLICT(job_id, kind) DO NOTHING')
      .run(id, jobId, kind, new Date().toISOString());
    if (inserted.changes && shareAddress) db.prepare('INSERT INTO report_location (report_id) VALUES (?)').run(id);
    return 'ok';
  });
}

export function reports(account: Account, since?: string, jobId?: string) {
  const [scope, ...values] = jobScope(account);
  return (storage().prepare(`
    SELECT r.*, j.zone, j.data, l.report_id AS share_address
    FROM reports r JOIN jobs j ON j.id = r.job_id LEFT JOIN report_location l ON l.report_id = r.id
    WHERE ${scope} AND (? IS NULL OR r.created >= ?) AND (? IS NULL OR j.id = ?)
    ORDER BY r.created DESC
  `).all(...values, since ?? null, since ?? null, jobId ?? null, jobId ?? null) as ReportRow[])
    .map((row) => {
      const location = (JSON.parse(row.data) as PickupJob).postcodeRecord;
      return {
        id: row.id, kind: row.kind, createdAt: row.created, closedAt: row.closed, zone: row.zone,
        area: location.area,
        address: row.share_address && !row.closed ? location.standardizedAddress : undefined,
      };
    });
}

export function closeReport(account: Account, id: string) {
  const [scope, ...values] = jobScope(account);
  return storage().prepare(`
    UPDATE reports SET closed = ?, closed_by = ?
    WHERE id = ? AND closed IS NULL AND job_id IN (SELECT j.id FROM jobs j WHERE ${scope})
  `).run(new Date().toISOString(), account.id, id, ...values).changes > 0;
}
