import type { ResolveGridAddressResult } from './types';
import type { PickupPosition } from './pickup-policy';
import { sampleAddress } from './demo-sample';
import { resolveAddressWithResolveGrid } from './resolvegrid';

export async function resolvePickup(query: string, position: PickupPosition | undefined, demo: boolean) {
  const sample = demo ? sampleAddress(query) : null;
  if (process.env.TRASHIFY_PILOT_STRUCTURE_MODE !== '1') {
    return demo ? sample : resolveAddressWithResolveGrid(query, position);
  }
  try {
    const endpoint = new URL('nipost/structure', process.env.RESOLVEGRID_API_URL || 'https://resolvegrid.aetherhost.com.ng/api/v1/resolve');
    const response = await fetch(endpoint, {
      method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12_000),
      headers: { 'Content-Type': 'application/json', 'X-ResolveGrid-Service-Token': process.env.RESOLVEGRID_SERVICE_TOKEN || '' },
      body: JSON.stringify({ code: query }),
    });
    const result = response.ok ? (await response.json()).data : null;
    const compact = query.toUpperCase().replace(/[ -]/g, '');
    if (result?.source !== 'NIPOST_STRUCTURE_VERIFIED' || result.building_verified !== false ||
        typeof result.postcode !== 'string' || result.postcode.replace(/-/g, '') !== compact ||
        !/^[A-Z]{2}-\d{2}-[A-Z]\d{2}$/.test(result.district)) return demo ? sample : null;
    const coordinates = demo ? sample?.coordinates : position ? { ...position, tierLevel: 3 as const } : undefined;
    return {
      rawInput: result.postcode, postcode: result.district, digitalPostcode: result.postcode,
      standardizedAddress: demo ? sample!.standardizedAddress : `Pilot pickup · ${result.postcode}`,
      state: result.state, lga: result.lga, area: result.area,
      confidence: 0, source: 'NIPOST_STRUCTURE_VERIFIED', needsConfirmation: true,
      coordinateOrigin: coordinates ? 'PILOT_RESIDENT_PIN' : undefined,
      coordinates, structureCheckedAt: result.checked_at,
    } satisfies ResolveGridAddressResult;
  } catch {
    return demo ? sample : null;
  }
}
