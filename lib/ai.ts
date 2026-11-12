import { isReportKind, reportKinds, type ReportKind } from './pickup-policy';

// Only allowlisted sanitation signals and district aggregates cross the model boundary.
const patterns: Record<ReportKind, RegExp> = {
  overflow: /\b(overflow\w*|full|piled|piling|spilling)\b/i,
  dumping: /\b(dump\w*|litter\w*|abandoned|scattered)\b/i,
  drainage: /\b(drain\w*|gutter\w*|blocked|clog\w*)\b/i,
  pests: /\b(rat\w*|rodent\w*|flies|maggot\w*|mosquito\w*|insect\w*|pest\w*)\b/i,
  missed: /\b(missed|late|overdue|uncollected|never|yesterday)\b/i,
};

async function structuredChoice(input: object, properties: Record<string, object>) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.TRASHIFY_AI_MODEL || 'gpt-4.1-mini', store: false, max_output_tokens: 180,
        instructions: 'Select from the allowed sanitation service categories using only the supplied signals or district counts. Return the requested JSON. Do not infer disease or health outcomes.',
        input: JSON.stringify(input),
        text: { format: { type: 'json_schema', name: 'sanitation_choice', strict: true,
          schema: { type: 'object', properties, required: Object.keys(properties), additionalProperties: false } } },
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== 'completed' || !Array.isArray(data.output)) return null;
    const text = data.output.flatMap((item: { content?: Array<{ type: string; text?: string }> }) => item.content || [])
      .filter((item: { type: string }) => item.type === 'output_text').map((item: { text: string }) => item.text).join('');
    return JSON.parse(text);
  } catch { return null; }
}

export async function suggestReport(text: string) {
  const signals = Object.entries(patterns).filter(([, pattern]) => pattern.test(text)).map(([kind]) => kind as ReportKind);
  if (!signals.length) return { kind: null, mode: 'rules', message: 'Choose the issue type that best fits what you observed.' };
  const choice = await structuredChoice({ task: 'report_category', sanitation_signals: signals }, {
    kind: { type: 'string', enum: signals },
  });
  const ai = isReportKind(choice?.kind) && signals.includes(choice.kind);
  const kind = ai ? choice.kind as ReportKind : signals.includes('drainage') ? 'drainage' : signals[0];
  return { kind, mode: ai ? 'ai' : 'rules', message: `${ai ? 'AI suggestion' : 'Keyword suggestion'} · ${reportKinds[kind]}. Review before sending.` };
}

export type DistrictAggregate = { district: string; due: number; completed: number; onTime: number; overdue: number; openReports: number };

export async function summarizePeriod(days: number, districts: DistrictAggregate[]) {
  const allowed = districts.filter((item) => /^[A-Z]{2}-\d{2}-[A-Z]\d{2}$/.test(item.district));
  const totals = allowed.reduce((sum, item) => ({ due: sum.due + item.due, onTime: sum.onTime + item.onTime,
    overdue: sum.overdue + item.overdue, openReports: sum.openReports + item.openReports }), { due: 0, onTime: 0, overdue: 0, openReports: 0 });
  const choice = allowed.length ? await structuredChoice({ task: 'service_summary_focus', days, districts: allowed }, {
    focus: { type: 'string', enum: ['overdue', 'reports', 'reliability'] },
  }) : null;
  const ai = ['overdue', 'reports', 'reliability'].includes(choice?.focus);
  const focus = ai ? choice.focus : totals.overdue ? 'overdue' : totals.openReports ? 'reports' : 'reliability';
  const ordered = [...allowed].sort((a, b) => focus === 'reports' ? b.openReports - a.openReports : b.overdue - a.overdue);
  const lines = [
    `In the last ${days} days, ${totals.due} pickups were due and ${totals.onTime} were collected on time. ${totals.overdue} ${totals.overdue === 1 ? 'pickup remains' : 'pickups remain'} overdue.`,
    `${totals.openReports === 1 ? 'There is' : 'There are'} ${totals.openReports} open sanitation ${totals.openReports === 1 ? 'report' : 'reports'} across all dates.`,
    ...ordered.slice(0, 6).map((item) => `${item.district}: ${item.onTime} of ${item.due} due pickups collected on time, ${item.overdue} still overdue and ${item.openReports} open reports.`),
  ];
  return { mode: ai ? 'ai' : 'rules', text: lines.join(' '), label: ai ? 'AI-assisted summary · verified dashboard figures' : 'Service summary · dashboard figures' };
}
