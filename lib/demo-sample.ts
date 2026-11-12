import type { ResolveGridAddressResult } from './types';

export const samplePostcode = 'FC-01-A01-KP-27';
export const samplePin = '4821';

export function sampleAddress(query: string): ResolveGridAddressResult | null {
  const compact = query.toUpperCase().replace(/[ -]/g, '');
  if (![samplePostcode.replace(/-/g, ''), 'FC02A09DB09'].includes(compact)) return null;
  return {
    rawInput: query, postcode: compact === 'FC02A09DB09' ? 'FC-02-A09' : 'FC-01-A01', digitalPostcode: compact === 'FC02A09DB09' ? 'FC-02-A09-DB-09' : samplePostcode,
    standardizedAddress: '12 Sample Crescent · Demonstration pickup', area: 'Sample area', lga: 'AMAC', state: 'Abuja',
    confidence: 1, source: 'RESOLVEGRID_FIXTURE', needsConfirmation: true,
    coordinates: { lat: 9.07874, lng: 7.47018, tierLevel: 4 },
  };
}
