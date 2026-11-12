import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { DatabaseSync } from 'node:sqlite';
import { setTimeout as wait } from 'node:timers/promises';

const directory = mkdtempSync(join(tmpdir(), 'trashify-test-'));
const dbPath = join(directory, 'test.sqlite');
const serviceToken = 'local-test-only';
const resolver = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/v1/nipost/structure' && request.headers['x-resolvegrid-service-token'] === serviceToken) {
    let raw = '';
    request.on('data', (chunk) => raw += chunk);
    request.on('end', () => {
      const code = JSON.parse(raw).code?.replace(/[ -]/g, '').toUpperCase();
      if (code !== 'FC01A01KP27') { response.writeHead(422).end('{}'); return; }
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ data: {
        postcode: 'FC-01-A01-KP-27', district: 'FC-01-A01', source: 'NIPOST_STRUCTURE_VERIFIED',
        building_verified: false, state: 'FCT', lga: 'Abaji', area: 'KP', checked_at: new Date().toISOString(),
      } }));
    });
    return;
  }
  if (url.pathname !== '/v1/nipost/lookup' || url.searchParams.get('strict') !== '1' ||
      request.headers['x-resolvegrid-service-token'] !== serviceToken) {
    response.writeHead(401).end();
    return;
  }
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify({
    upstream_geometry_verified: !url.searchParams.has('lat'),
    upstream_postcode_verified: true,
    coordinate_origin: url.searchParams.has('lat') ? 'RESIDENT_DEVICE_REVERSE_MATCH' : 'NIPOST_GEOMETRY',
    data: {
      postcode: 'FC-02-A09-DB-09', legacy_postal_code: 'FC-02-A09', source: 'NIPOST_API_SANDBOX',
      administrative_address: { locality_name: 'Wuse II', lga_name: 'AMAC', state_name: 'Abuja' },
      recent_house_address: { recent: 'Test building, Wuse II' },
      coordinates: { latitude: 9.07874, longitude: 7.47018 },
    },
  }));
});
resolver.listen(0, '127.0.0.1');
await once(resolver, 'listening');
const portReservation = createServer().listen(0, '127.0.0.1');
await once(portReservation, 'listening');
const port = portReservation.address().port;
await new Promise((resolve) => portReservation.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const environment = {
  ...process.env,
  TRASHIFY_DB_PATH: dbPath, TRASHIFY_ORIGIN: origin, TRASHIFY_ALLOW_SAMPLE_ADDRESSES: '0', TRASHIFY_PILOT_STRUCTURE_MODE: '0', OPENAI_API_KEY: '',
  RESOLVEGRID_SERVICE_TOKEN: serviceToken, RESOLVEGRID_NIPOST_API_KEY: '',
  RESOLVEGRID_API_URL: `http://127.0.0.1:${resolver.address().port}/v1/resolve`,
};

let server;
async function start() {
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)],
    { env: environment, stdio: ['ignore', 'pipe', 'inherit'] });
  for (let count = 0; count < 60; count++) {
    if (server.exitCode !== null) throw new Error('Build Trashify before running the pilot tests.');
    try { if ((await fetch(origin, { signal: AbortSignal.timeout(750) })).ok) return; } catch { /* wait for the server */ }
    await wait(150);
  }
  throw new Error('Trashify did not start.');
}

async function stop() {
  if (server?.exitCode === null) {
    const done = once(server, 'exit');
    server.kill();
    await done;
  }
}

function client() {
  let cookie = '';
  return async (path, options = {}) => {
    const { method = 'GET', body, headers = {} } = options;
    const response = await fetch(origin + path, {
      method,
      headers: { origin, ...(cookie ? { cookie } : {}), ...(body && { 'content-type': 'application/json' }), ...headers },
      body: body && JSON.stringify(body),
    });
    const session = response.headers.get('set-cookie');
    if (session) cookie = session.split(';')[0];
    return { status: response.status, data: await response.json(), session };
  };
}

const access = (...args) => execFileSync(process.execPath, ['scripts/access.mjs', ...args], {
  env: environment, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
}).trim();

const register = (as, role, email, invitation = '') => as('/api/auth', {
  method: 'POST', body: { action: 'register', name: 'Test account', role, email, invitation, password: 'test-passphrase-only' },
});

try {
  await start();
  const anonymous = client();
  const resident = client();
  const neighbour = client();
  const collector = client();
  const outsider = client();
  const estate = client();
  const municipal = client();
  const outsideMunicipal = client();

  assert.equal((await anonymous('/api/jobs')).status, 401);
  assert.equal((await anonymous('/api/zones')).status, 401);
  assert.equal((await anonymous('/api/auth', { method: 'POST', headers: { origin: 'https://invalid.example' } })).status, 403);
  assert.equal((await register(anonymous, 'municipal', 'invalid@example.test')).status, 400);
  const demo = client();
  const otherDemo = client();
  const enterDemo = (as, role) => as('/api/demo', { method: 'POST', body: { role } });
  assert.equal((await enterDemo(demo, 'resident')).data.path, '/pickups');
  const sampleLookup = await demo('/api/resolve', { method: 'POST', body: { query: 'FC-02-A09-DB-09' } });
  assert.equal(sampleLookup.data.source, 'RESOLVEGRID_FIXTURE');
  assert.equal((await demo('/api/resolve', { method: 'POST', body: { query: 'Private test address' } })).status, 422);
  const seeded = (await demo('/api/jobs')).data.jobs;
  assert.equal(seeded.length, 6);
  const activeDemoJob = seeded.find((job) => job.status === 'collector_en_route');
  assert.equal((await enterDemo(otherDemo, 'municipal')).data.path, '/dashboard');
  assert.equal((await otherDemo('/api/jobs/' + activeDemoJob.id)).status, 404);
  assert.equal((await enterDemo(demo, 'collector')).data.path, '/jobs');
  assert.equal((await demo('/api/jobs/' + activeDemoJob.id)).data.job.verification.confirmationCode, undefined);
  const simulated = await demo('/api/evidence', { method: 'POST', body: {
    jobId: activeDemoJob.id, customerConfirmationCode: activeDemoJob.verification.confirmationCode, simulateDemoLocation: true,
  } });
  assert.equal(simulated.data.job.status, 'verified_completed');
  assert.equal(simulated.data.job.verification.gpsVerified, false);
  assert.equal((await enterDemo(demo, 'estate')).data.path, '/dashboard');
  const demoReport = (await demo('/api/zones')).data.reports[0];
  assert.ok(demoReport);
  assert.equal((await otherDemo('/api/reports', { method: 'PATCH', body: { id: demoReport.id } })).status, 404);
  assert.equal((await demo('/api/reports', { method: 'PATCH', body: { id: demoReport.id } })).status, 200);
  assert.equal((await enterDemo(demo, 'municipal')).data.path, '/dashboard');
  assert.equal((await demo('/api/zones')).data.metrics.due, 5);
  assert.equal((await demo('/api/zones')).data.reports.length, 0);
  assert.equal((await otherDemo('/api/zones')).data.reports.length, 1);
  const invite = access('invite', 'resident', 'resident@example.test', 'estate-one');
  const residentSession = await register(resident, 'resident', 'resident@example.test', invite);
  assert.equal(residentSession.data.path, '/pickups');
  assert.equal((await enterDemo(resident, 'resident')).status, 409);
  assert.match(residentSession.session, /HttpOnly/i);
  assert.match(residentSession.session, /Secure/i);
  assert.equal((await register(neighbour, 'resident', 'neighbour@example.test', invite)).status, 400);
  assert.equal((await register(neighbour, 'resident', 'neighbour@example.test')).status, 200);
  assert.equal((await register(collector, 'collector', 'collector@example.test')).data.path, '/pending');
  assert.equal((await collector('/api/jobs')).status, 403);
  await register(outsider, 'collector', 'outside@example.test');
  access('approve', 'collector@example.test', 'FC-02-A09', 'TEST-LICENCE', 'Mini truck', 'mixed');
  access('approve', 'outside@example.test', 'FC-02-A07', 'OUTSIDE-LICENCE', 'Mini truck', 'mixed');

  const lookup = await resident('/api/resolve', { method: 'POST', body: { query: 'FC-02-A09-DB-09' } });
  assert.equal(lookup.data.source, 'NIPOST_SANDBOX');
  const position = { lat: 9.07874, lng: 7.47018 };
  const reverse = await resident('/api/resolve', { method: 'POST', body: { query: 'FC-02-A09-DB-09', position } });
  assert.equal(reverse.data.coordinateOrigin, 'RESIDENT_DEVICE_REVERSE_MATCH');
  assert.equal(reverse.data.postcode, 'FC-02-A09');
  const booking = {
    rawAddressInput: 'FC-02-A09-DB-09', confirmedPostcode: 'FC-02-A09-DB-09', position,
    wasteCategories: ['mixed'], estimatedBags: 3, pickupWindow: 'Morning (08:00 - 11:00)', customerPhone: '+2348000000000',
  };
  const create = { method: 'POST', body: booking, headers: { 'idempotency-key': randomUUID() } };
  const results = await Promise.all([resident('/api/jobs', create), resident('/api/jobs', create)]);
  assert.equal(results[0].data.job.id, results[1].data.job.id);
  const job = results[0].data.job;
  assert.equal(job.status, 'requested');
  const detail = '/api/jobs/' + job.id;
  assert.equal((await neighbour(detail)).status, 404);
  assert.equal((await resident(detail, { method: 'PATCH' })).status, 403);
  assert.equal((await resident('/api/reports', { method: 'POST', body: { jobId: job.id, kind: 'missed' } })).status, 422);

  await collector('/api/collectors', { method: 'PATCH', body: { available: true } });
  assert.equal((await collector(detail)).data.job.status, 'collector_matched');
  assert.equal((await collector(detail)).data.job.verification.confirmationCode, undefined);
  assert.equal((await outsider(detail, { method: 'PATCH' })).status, 404);
  assert.equal((await collector('/api/evidence', { method: 'POST', body: {
    jobId: job.id, customerConfirmationCode: job.verification.confirmationCode, simulateDemoLocation: true,
  } })).status, 422);
  assert.equal((await collector(detail, { method: 'PATCH' })).data.job.status, 'collector_en_route');
  const evidence = (pin, lat, lng) => collector('/api/evidence', { method: 'POST', body: {
    jobId: job.id, customerConfirmationCode: pin, gpsLocation: { lat, lng, accuracyMeters: 10 },
  } });
  assert.equal((await evidence(job.verification.confirmationCode === '0000' ? '0001' : '0000', 9.07874, 7.47018)).status, 422);
  assert.equal((await evidence(job.verification.confirmationCode, 6.5, 3.3)).status, 422);
  assert.equal((await evidence(job.verification.confirmationCode, 9.07874, 7.47018)).data.job.status, 'verified_completed');

  for (const [as, role, email, scope] of [
    [estate, 'estate', 'estate@example.test', 'estate-one'],
    [municipal, 'municipal', 'municipal@example.test', 'FC-02-A09'],
    [outsideMunicipal, 'municipal', 'outside-staff@example.test', 'FC-02-A07'],
  ]) {
    assert.equal((await register(as, role, email, access('invite', role, email, scope))).status, 200);
  }
  assert.equal((await outsideMunicipal(detail)).status, 404);
  assert.equal((await municipal('/api/jobs/' + activeDemoJob.id)).status, 404);
  assert.equal((await demo(detail)).status, 404);
  const staffJob = (await estate(detail)).data.job;
  assert.equal(staffJob.customerPhone, undefined);
  assert.equal(staffJob.postcodeRecord, undefined);
  assert.equal(staffJob.verification, undefined);

  // Shift the isolated test job into the elapsed-window cohort for deterministic metrics.
  const database = new DatabaseSync(dbPath);
  const due = new Date(Date.now() - 60_000).toISOString();
  database.prepare("UPDATE jobs SET data = json_set(data, '$.dueAt', ?, '$.createdAt', ?) WHERE id = ?")
    .run(due, new Date(Date.now() - 3600_000).toISOString(), job.id);
  database.close();
  assert.equal((await municipal('/api/zones')).data.metrics.due, 1);
  assert.equal((await municipal('/api/zones')).data.metrics.onTime, 0);
  assert.equal((await outsideMunicipal('/api/zones')).data.metrics.due, 0);

  const report = (await resident('/api/reports', {
    method: 'POST', body: { jobId: job.id, kind: 'drainage', shareAddress: true },
  })).data.reports[0];
  assert.equal((await estate('/api/zones')).data.reports[0].address, 'Test building, Wuse II');
  assert.equal((await outsideMunicipal('/api/reports', { method: 'PATCH', body: { id: report.id } })).status, 404);
  assert.equal((await municipal('/api/reports', { method: 'PATCH', body: { id: report.id } })).status, 200);
  const closed = (await resident('/api/reports?jobId=' + job.id)).data.reports[0];
  assert.ok(closed.closedAt);
  assert.equal(closed.address, undefined);

  await stop();
  await start();
  assert.equal((await resident(detail)).data.job.status, 'verified_completed');
  await resident('/api/auth', { method: 'POST', body: { action: 'logout' } });
  assert.equal((await resident(detail)).status, 401);
  assert.equal((await anonymous(detail, { headers: { cookie: residentSession.session.split(';')[0] } })).status, 401);
  const signin = await resident('/api/auth', { method: 'POST', body: {
    action: 'login', role: 'resident', email: 'resident@example.test', password: 'test-passphrase-only',
  } });
  assert.equal(signin.data.path, '/pickups');
  const resetCode = access('reset', 'resident@example.test');
  const reset = { method: 'POST', body: {
    action: 'reset', email: 'resident@example.test', token: resetCode, password: 'new-test-passphrase-only',
  } };
  assert.equal((await anonymous('/api/auth', reset)).status, 200);
  assert.equal((await anonymous('/api/auth', reset)).status, 400);
  assert.equal((await resident(detail)).status, 401);
  const exported = await fetch(origin + '/api/zones/export', {
    headers: { cookie: (await municipal('/api/auth', {
      method: 'POST', body: { action: 'login', role: 'municipal', email: 'municipal@example.test', password: 'test-passphrase-only' },
    })).session.split(';')[0] },
  });
  assert.equal(exported.status, 200);
  assert.equal((await exported.text()).trim().split('\n').length, 1);
  const aiReport = await neighbour('/api/ai/report', { method: 'POST', body: { text: 'Ada at 12 Sample Street says rubbish is blocking the gutter. Call 08012345678' } });
  assert.equal(aiReport.data.kind, 'drainage');
  assert.equal(aiReport.data.mode, 'rules');
  assert.equal(JSON.stringify(aiReport.data).includes('08012345678'), false);
  assert.equal((await neighbour('/api/ai/summary', { method: 'POST', body: {} })).status, 403);
  const summary = await municipal('/api/ai/summary', { method: 'POST', body: { days: 30 } });
  assert.equal(summary.data.mode, 'rules');
  assert.ok(summary.data.text.includes('FC-02-A09'));
  assert.equal(summary.data.text.includes('Test building'), false);
  await stop();
  environment.TRASHIFY_PILOT_STRUCTURE_MODE = '1';
  await start();
  const pilot = await neighbour('/api/resolve', { method: 'POST', body: { query: 'FC-01-A01-KP-27', position: { lat: 9, lng: 7 } } });
  assert.equal(pilot.data.source, 'NIPOST_STRUCTURE_VERIFIED');
  assert.equal(pilot.data.coordinateOrigin, 'PILOT_RESIDENT_PIN');
  assert.equal((await neighbour('/api/resolve', { method: 'POST', body: { query: 'FC-01-A01-XX-27' } })).status, 422);
  const pilotBooking = await neighbour('/api/jobs', { method: 'POST', headers: { 'Idempotency-Key': randomUUID() }, body: {
    ...booking, rawAddressInput: 'FC-01-A01-KP-27', confirmedPostcode: 'FC-01-A01-KP-27', position: { lat: 9, lng: 7 },
  } });
  assert.equal(pilotBooking.status, 201);
  assert.equal(pilotBooking.data.job.postcodeRecord.source, 'NIPOST_STRUCTURE_VERIFIED');
  console.log('Pilot checks passed: demo and role boundaries, restart persistence, postcode, duplicate booking, PIN/GPS, reports, metrics, login and logout.');
} finally {
  await stop();
  resolver.close();
  rmSync(directory, { recursive: true, force: true });
}
