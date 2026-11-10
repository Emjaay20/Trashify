import type { WasteCategory } from './types';

export const wasteCategories: WasteCategory[] = ['mixed', 'plastics', 'paper', 'metal', 'e-waste', 'organic'];

export const pickupWindows = [
  { value: 'Morning (08:00 - 11:00)', hour: 11 },
  { value: 'Midday (11:30 - 14:00)', hour: 14 },
  { value: 'Afternoon (14:30 - 17:00)', hour: 17 },
] as const;

export function pickupDeadline(window: string, now: Date) {
  const option = pickupWindows.find((item) => item.value === window);
  if (!option) return null;
  const lagosDate = new Date(now.getTime() + 3600_000).toISOString().slice(0, 10);
  const due = new Date(`${lagosDate}T${String(option.hour).padStart(2, '0')}:00:00+01:00`);
  if (due.getTime() <= now.getTime()) due.setUTCDate(due.getUTCDate() + 1);
  return due;
}

export function pickupPrice(bags: number, categories: WasteCategory[]) {
  return {
    priceNgn: 3000 + (bags - 1) * 600,
    recyclableCreditNgn: categories.some((item) => ['plastics', 'paper', 'metal'].includes(item)) ? 200 * bags : 0,
  };
}

export const reportKinds = {
  overflow: 'Overflowing waste',
  dumping: 'Waste dumped in an open area',
  drainage: 'Waste blocking a drain',
  pests: 'Insects or rodents around waste',
  missed: 'Scheduled collection missed',
} as const;

export type ReportKind = keyof typeof reportKinds;

export function isReportKind(value: unknown): value is ReportKind {
  return typeof value === 'string' && Object.hasOwn(reportKinds, value);
}

export type PickupPosition = { lat: number; lng: number };

export function isPickupPosition(value: unknown): value is PickupPosition {
  if (typeof value !== 'object' || value === null || !('lat' in value) || !('lng' in value)) return false;
  return typeof value.lat === 'number' && Number.isFinite(value.lat) && Math.abs(value.lat) <= 90 &&
    typeof value.lng === 'number' && Number.isFinite(value.lng) && Math.abs(value.lng) <= 180;
}

export function isServiceZone(value: string) {
  return /^(?:[A-Z]{2}-\d{2}-[A-Z]\d{2}|\d{6})$/.test(value);
}
