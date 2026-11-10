'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { reportKinds, type ReportKind } from '@/lib/pickup-policy';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type Report = { id: string; kind: ReportKind; closedAt: string | null };

export function PickupReports({ jobId, canReportMissed }: { jobId: string; canReportMissed: boolean }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const request = new AbortController();
    fetch(`/api/reports?jobId=${encodeURIComponent(jobId)}`, { signal: request.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setReports((await response.json()).reports);
      }).catch(() => {
        if (!request.signal.aborted) setError('Could not load reports.');
      });
    return () => request.abort();
  }, [jobId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/reports', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId, kind: fields.get('kind'), shareAddress: fields.get('shareAddress') === 'on' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setReports(data.reports);
      setMessage('Report submitted.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not submit the report.');
    } finally {
      setBusy(false);
    }
  }

  const available = Object.entries(reportKinds).filter(([kind]) =>
    (kind !== 'missed' || canReportMissed) && !reports.some((report) => report.kind === kind));

  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold">Report a sanitation issue</h2></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-[var(--muted)]">Tell the service team what you observed near this pickup. Your report includes the issue type and postal zone.</p>
        {reports.length > 0 && (
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
            {reports.map((report) => <li key={report.id} className="flex justify-between gap-4 py-2">
              <span>{reportKinds[report.kind]}</span><span className="font-medium">{report.closedAt ? 'Addressed' : 'Open'}</span>
            </li>)}
          </ul>
        )}
        {available.length > 0 && (
          <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">Issue type
              <select name="kind" required defaultValue="" className="w-full rounded-md border border-[var(--line-2)] bg-[var(--surface)] px-3 py-2">
                <option value="" disabled>Choose an issue</option>
                {available.map(([kind, label]) => <option key={kind} value={kind}>{label}</option>)}
              </select>
            </label>
            <label className="flex basis-full items-start gap-2 text-sm text-[var(--muted)]">
              <input type="checkbox" name="shareAddress" className="mt-1 accent-[var(--accent)]" />
              Share this pickup address with the service team so they can locate the issue.
            </label>
            <Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send report'}</Button>
          </form>
        )}
        {message && <p role="status" className="text-sm text-[var(--accent)]">{message}</p>}
        {error && <p role="alert" className="text-sm text-[var(--red-tx)]">{error}</p>}
      </CardContent>
    </Card>
  );
}
