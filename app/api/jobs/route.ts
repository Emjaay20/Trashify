import { sampleAddress } from '@/lib/demo-sample';
import { apiAccount, apiError, attempt, privateJson } from '@/lib/auth';
import { createJob, findBookingRequest, getJobs, visibleJob } from '@/lib/db';
import { isPickupPosition, pickupDeadline, pickupPrice, wasteCategories } from '@/lib/pickup-policy';
import { resolveAddressWithResolveGrid } from '@/lib/resolvegrid';
import type { WasteCategory } from '@/lib/types';

export async function GET(request: Request) {
  const account = await apiAccount(request, ['resident', 'collector', 'estate', 'municipal']);
  if (account instanceof Response) return account;
  return privateJson({ jobs: getJobs(account).map((job) => visibleJob(account, job)) });
}

export async function POST(request: Request) {
  const account = await apiAccount(request, ['resident']);
  if (account instanceof Response) return account;
  const requestId = request.headers.get('idempotency-key') ?? '';
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(requestId)) {
    return apiError('A valid booking request ID is required.', 400);
  }
  const existing = findBookingRequest(account, requestId);
  if (existing) return privateJson({ job: visibleJob(account, existing) });
  if (!attempt(`booking:${account.id}`, 12, 3600_000)) return apiError('Try again in an hour.', 429);
  const body = await request.json().catch(() => null);
  const address = typeof body?.rawAddressInput === 'string' ? body.rawAddressInput.trim() : '';
  const phone = typeof body?.customerPhone === 'string' ? body.customerPhone.trim() : '';
  const bags = body?.estimatedBags;
  const categories = body?.wasteCategories;
  const window = body?.pickupWindow;
  const position = body?.position;
  const due = pickupDeadline(window, new Date());
  if (!address || address.length > 300 || (phone && !/^\+?[\d ()-]{7,22}$/.test(phone)) || !due ||
      !Number.isInteger(bags) || bags < 1 || bags > 100 || !Array.isArray(categories) ||
      !categories.length || categories.length > wasteCategories.length || (position !== undefined && !isPickupPosition(position)) ||
      !categories.every((category: WasteCategory) => wasteCategories.includes(category))) {
    return apiError('Check the pickup location, phone, waste types, bag count and pickup window.', 400);
  }

  const postcodeRecord = account.demoGroup ? sampleAddress(address) : await resolveAddressWithResolveGrid(address, position);
  if (!postcodeRecord || !postcodeRecord.coordinates ||
      body.confirmedPostcode !== (postcodeRecord.digitalPostcode ?? postcodeRecord.postcode)) {
    return apiError('Look up and confirm a pickup location with building coordinates.', 422);
  }

  const uniqueCategories = [...new Set<WasteCategory>(categories)];
  const job = createJob(account, {
    customerPhone: account.demoGroup ? '' : phone, rawAddressInput: postcodeRecord.rawInput, postcodeRecord, wasteCategories: uniqueCategories,
    estimatedBags: bags, scheduledDate: new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeZone: 'Africa/Lagos' }).format(due),
    pickupWindow: window, dueAt: due.toISOString(), ...pickupPrice(bags, uniqueCategories),
  }, requestId);
  return job ? privateJson({ job: visibleJob(account, job) }, 201) : apiError('Account access changed. Sign in again.', 403);
}
