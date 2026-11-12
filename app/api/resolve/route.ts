import { apiAccount, apiError, attempt, privateJson } from '@/lib/auth';
import { isPickupPosition } from '@/lib/pickup-policy';
import { resolvePickup } from '@/lib/pilot-resolve';

export async function POST(request: Request) {
  const account = await apiAccount(request, ['resident']);
  if (account instanceof Response) return account;
  const body = await request.json().catch(() => null);
  const query = typeof body?.query === 'string' ? body.query.trim() : '';
  if (!query || query.length > 300) return apiError('Enter a building postcode or address of up to 300 characters.', 400);
  if (!attempt(`resolve:${account.id}`, 60, 3600_000)) return apiError('Too many lookups. Try again in an hour.', 429);
  const position = body?.position;
  if (position !== undefined && !isPickupPosition(position)) return apiError('Invalid pickup coordinates.', 400);
  const result = await resolvePickup(query, position, Boolean(account.demoGroup));
  if (!result || (!result.coordinates && result.source !== 'NIPOST_STRUCTURE_VERIFIED')) return apiError(account.demoGroup ? 'Choose the sample postcode to try a lookup.' : position ? 'Could not match this location to that postcode. Check the building code and try from the pickup spot.'
    : 'No verified building coordinates found. Enter the exact building postcode and verify it from the pickup spot.', 422);
  return privateJson(result);
}
