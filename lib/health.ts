import type { PickupJob } from './types';

const day = 86_400_000;

export function serviceMetrics(jobs: PickupJob[], days: number, now = Date.now()) {
  const first = now - days * day;
  const cohort = jobs.filter((job) => {
    const deadline = Date.parse(job.dueAt ?? '');
    return deadline >= first && deadline <= now;
  });
  const completed = cohort.filter((job) => (job.status === 'verified_completed' || job.status === 'paid') &&
    Number.isFinite(Date.parse(job.verification?.timestamp ?? '')));
  const onTime = completed.filter((job) => Date.parse(job.verification!.timestamp) <= Date.parse(job.dueAt!));
  const waits = completed.map((job) => (Date.parse(job.verification!.timestamp) - Date.parse(job.createdAt)) / 3600_000)
    .filter((hours) => Number.isFinite(hours) && hours >= 0).sort((a, b) => a - b);
  const middle = Math.floor(waits.length / 2);
  const medianHours = waits.length
    ? Math.round(10 * (waits.length % 2 ? waits[middle] : (waits[middle - 1] + waits[middle]) / 2)) / 10
    : null;
  return {
    due: cohort.length, completed: completed.length, onTime: onTime.length,
    overdue: cohort.length - completed.length, medianHours,
  };
}
