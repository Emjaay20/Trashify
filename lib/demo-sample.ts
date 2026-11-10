import type { ResolveGridAddressResult } from './types';

export const samplePostcode = 'FC-02-A09-DB-09';
export const samplePin = '4821';

export function sampleAddress(query: string): ResolveGridAddressResult | null {
  const compact = query.toUpperCase().replace(/[ -]/g, '');
  if (compact !== samplePostcode.replace(/-/g, '')) return null;
  return {
    rawInput: samplePostcode, postcode: 'FC-02-A09', digitalPostcode: samplePostcode,
    standardizedAddress: '12 Sample Crescent, Wuse II, Abuja', area: 'Wuse II', lga: 'AMAC', state: 'Abuja',
    confidence: 1, source: 'RESOLVEGRID_FIXTURE', needsConfirmation: true,
    coordinates: { lat: 9.07874, lng: 7.47018, tierLevel: 4 },
  };
}
