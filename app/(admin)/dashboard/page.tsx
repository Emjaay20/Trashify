'use client';

import { useCallback, useEffect, useState } from 'react';
import { reportKinds, type ReportKind } from '@/lib/pickup-policy';

type Metrics = { due: number; completed: number; onTime: number; overdue: number; medianHours: number | null };
type DashboardData = {
  role: 'estate' | 'municipal'; scope: string; metrics: Metrics; reported: number; closed: number;
  zones: Array<Metrics & { code: string; area: string }>;
  reports: Array<{ id: string; kind: ReportKind; createdAt: string; zone: string; area: string; address?: string }>;
};

function rate(value: number, total: number) {
  return total ? `${Math.round(value / total * 100)}%` : '—';
}

export default function DashboardPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState('');

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/zones?days=${days}`, { signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setData(data);
      setError('');
    } catch (error) {
      if (!signal?.aborted) setError(error instanceof Error ? error.message : 'Could not load service metrics.');
    }
  }, [days]);

  useEffect(() => {
    const request = new AbortController();
    const timer = setTimeout(() => void load(request.signal), 0);
    return () => { clearTimeout(timer); request.abort(); };
  }, [load]);

  async function resolveReport(id: string) {
    setClosing(id);
    try {
      const response = await fetch('/api/reports', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await load();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not close the report.');
    } finally {
      setClosing('');
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--line)] pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            {data?.role === 'estate' ? 'Estate' : 'Municipal'} workspace
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Collection and sanitation</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {data ? `${data.role === 'estate' ? 'Estate' : 'Service districts'} · ${data.scope}` : 'Pickup reliability and resident reports'}
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm font-medium">
          Period
          <select value={days} onChange={(event) => { setData(null); setDays(Number(event.target.value)); }}
            className="rounded-md border border-[var(--line-2)] bg-[var(--surface)] px-3 py-2">
            <option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
          </select>
        </label>
      </header>
      {error && <p role="alert" className="text-sm text-[var(--red-tx)]">{error}</p>}
      {!data && !error && <p role="status" className="text-sm text-[var(--muted)]">Loading service data…</p>}
      {data && (
        <>
          <section aria-labelledby="reliability">
            <h2 id="reliability" className="mb-3 text-xl font-semibold">Pickup reliability</h2>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[var(--line)] bg-[var(--line)] md:grid-cols-4">
              {[
                ['Pickups due', String(data.metrics.due), 'Windows that ended in this period'],
                ['On-time collection', rate(data.metrics.onTime, data.metrics.due), `${data.metrics.onTime} of ${data.metrics.due} due`],
                ['Still overdue', String(data.metrics.overdue), 'Past the window and uncollected'],
                ['Median time to collect', data.metrics.medianHours === null ? '—' : `${data.metrics.medianHours} h`, 'Booking to collection among completed pickups'],
              ].map(([label, value, detail]) => (
                <div key={label} className="bg-[var(--surface)] p-4 sm:p-5">
                  <dt className="text-sm font-medium">{label}</dt>
                  <dd className="my-1 text-3xl font-semibold tabular-nums text-[var(--accent)]">{value}</dd>
                  <dd className="text-xs text-[var(--muted)]">{detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="zones" className="space-y-3">
            <h2 id="zones" className="text-xl font-semibold">Reliability by service district</h2>
            {data.zones.length === 0 ? (
              <p className="border-y border-[var(--line)] py-4 text-sm text-[var(--muted)]">Zone comparisons appear after pickup windows end.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-[var(--line)] bg-[var(--surface)]">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead className="bg-[var(--surface-2)]">
                    <tr>{['Service district', 'Due', 'Collected', 'On time', 'Still overdue'].map((label) => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {data.zones.map((zone) => (
                      <tr key={zone.code}>
                        <th scope="row" className="px-4 py-3 font-semibold">{zone.area} <span className="text-[var(--muted)]">{zone.code}</span></th>
                        <td className="px-4 py-3">{zone.due}</td><td className="px-4 py-3">{zone.completed}</td>
                        <td className="px-4 py-3">{zone.onTime}/{zone.due}</td><td className="px-4 py-3">{zone.overdue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a href={`/api/zones/export?days=${days}`} download className="text-sm font-semibold text-[var(--accent)] underline underline-offset-4">Download aggregate CSV</a>
              <span className="text-xs text-[var(--muted)]">Exports omit zones with fewer than five due pickups.</span>
            </div>
            <p className="text-sm text-[var(--muted)]">These figures describe pickups booked through Trashify in your workspace. Zone totals show the number of bookings behind each rate.</p>
          </section>

          <section aria-labelledby="sanitation" className="space-y-3">
            <h2 id="sanitation" className="text-xl font-semibold">Sanitation reports</h2>
            <p className="text-sm text-[var(--muted)]">{data.reported} reported in the last {days} days · {data.closed} of those closed · {data.reports.length} open across all dates</p>
            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {data.reports.length === 0 && <p className="py-4 text-sm text-[var(--muted)]">No open reports in your workspace.</p>}
              {data.reports.map((report) => (
                <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-medium">{reportKinds[report.kind]}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {report.area} · {report.zone} · {new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeZone: 'Africa/Lagos' }).format(new Date(report.createdAt))}
                    </p>
                    {report.address && <p className="text-sm">{report.address}</p>}
                    <p className="text-xs text-[var(--muted)]">Report {report.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <button type="button" disabled={Boolean(closing)} onClick={() => void resolveReport(report.id)}
                    className="rounded-md border border-[var(--line-2)] px-3 py-2 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--surface-2)] disabled:opacity-50">
                    {closing === report.id ? 'Saving…' : 'Mark addressed'}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--muted)]">Mark a report addressed after confirming the issue has been handled.</p>
          </section>
        </>
      )}
    </div>
  );
}
