import { ResolveGridAddressResult } from './types';
import type { PickupPosition } from './pickup-policy';

const RESOLVEGRID_API_URL = process.env.RESOLVEGRID_API_URL || 'https://resolvegrid.aetherhost.com.ng/api/v1/resolve';

interface ResolveGridMatch {
  postcode?: string;
  source?: string;
  administrative_address?: { locality_name?: string; lga_name?: string; state_name?: string };
  recent_house_address?: { recent?: string; landmark_notes?: string };
  coordinates?: { latitude?: number; longitude?: number };
}

interface ResolveGridResponse {
  resolved?: boolean;
  confidence?: number;
  primary_match?: ResolveGridMatch;
}

interface LookupResponse {
  data?: ResolveGridMatch;
  upstream_geometry_verified?: boolean;
  upstream_postcode_verified?: boolean;
  coordinate_origin?: ResolveGridAddressResult['coordinateOrigin'];
}

/**
 * Local Abuja demonstration fixtures covering key pilot municipal zones.
 * Tier Levels:
 * Tier 1: State / Region Centroid
 * Tier 2: LGA Centroid
 * Tier 3: District / Suburb Centroid
 * Tier 4: Postcode Polygon / Landmark Centroid
 * Tier 5: Official NIPOST Point Geometry (Exact premise coordinates)
 */
const NIPOST_PILOT_FIXTURES: Record<string, Omit<ResolveGridAddressResult, 'rawInput'>> = {
  '900211': {
    postcode: '900211',
    area: 'Wuse 2',
    lga: 'AMAC',
    state: 'FCT — Abuja',
    standardizedAddress: '14 Adetokunbo Ademola Crescent, Wuse 2, AMAC, Abuja FCT',
    landmarkMatch: 'Banex Plaza Area (320m)',
    confidence: 0.89,
    source: 'RESOLVEGRID_FIXTURE',
    needsConfirmation: true,
    coordinates: { lat: 9.0765, lng: 7.4812, tierLevel: 4 },
  },
  '900271': {
    postcode: '900271',
    area: 'Maitama',
    lga: 'AMAC',
    state: 'FCT — Abuja',
    standardizedAddress: 'Aguiyi Ironsi Way, Maitama, AMAC, Abuja FCT',
    landmarkMatch: 'Farmers Market / Transcorp Hilton',
    confidence: 0.94,
    source: 'RESOLVEGRID_FIXTURE',
    needsConfirmation: true,
    coordinates: { lat: 9.0833, lng: 7.4951, tierLevel: 4 },
  },
  '900001': {
    postcode: '900001',
    area: 'Garki 1',
    lga: 'AMAC',
    state: 'FCT — Abuja',
    standardizedAddress: 'Area 11, Shehu Shagari Way, Garki 1, AMAC, Abuja FCT',
    landmarkMatch: 'Federal Secretariat Complex',
    confidence: 0.96,
    source: 'RESOLVEGRID_FIXTURE',
    needsConfirmation: true,
    coordinates: { lat: 9.0543, lng: 7.4902, tierLevel: 5 },
  },
  '900231': {
    postcode: '900231',
    area: 'Asokoro',
    lga: 'AMAC',
    state: 'FCT — Abuja',
    standardizedAddress: 'Yakubu Gowon Crescent, Asokoro, AMAC, Abuja FCT',
    landmarkMatch: 'Near ECOWAS Secretariat',
    confidence: 0.82,
    source: 'RESOLVEGRID_FIXTURE',
    needsConfirmation: true,
    coordinates: { lat: 9.0489, lng: 7.5218, tierLevel: 4 },
  },
  '900108': {
    postcode: '900108',
    area: 'Jabi',
    lga: 'AMAC',
    state: 'FCT — Abuja',
    standardizedAddress: 'Alex Ekwueme Way, Jabi Lake District, AMAC, Abuja FCT',
    landmarkMatch: 'Jabi Lake Mall (450m)',
    confidence: 0.91,
    source: 'RESOLVEGRID_FIXTURE',
    needsConfirmation: true,
    coordinates: { lat: 9.0682, lng: 7.4241, tierLevel: 4 },
  },
  '900104': {
    postcode: '900104',
    area: 'Gwarinpa',
    lga: 'AMAC',
    state: 'FCT — Abuja',
    standardizedAddress: '3rd Avenue, Gwarinpa Estate, AMAC, Abuja FCT',
    landmarkMatch: 'Setraco Gate / 3rd Avenue Commercial Hub',
    confidence: 0.88,
    source: 'RESOLVEGRID_FIXTURE',
    needsConfirmation: true,
    coordinates: { lat: 9.1084, lng: 7.4116, tierLevel: 4 },
  },
};

const demoZones = [
  ['900211', /\b(banex|wuse|900211)\b/],
  ['900271', /\b(maitama|farmers market|transcorp|900271)\b/],
  ['900001', /\b(garki|secretariat|area 11|900001)\b/],
  ['900231', /\b(asokoro|ecowas|900231)\b/],
  ['900108', /\b(jabi|lake mall|900108)\b/],
  ['900104', /\b(gwarinpa|3rd avenue|setraco|900104)\b/],
] as const;

export async function resolveAddressWithResolveGrid(query: string, position?: PickupPosition): Promise<ResolveGridAddressResult | null> {
  const normalized = query.trim().toLowerCase();
  const compact = normalized.replace(/[ -]/g, '').toUpperCase();
  const isExactCode = /^[A-Z]{2}\d{2}[A-Z]\d{2}[A-Z]{2}\d{2}$/.test(compact);
  const allowSamples = process.env.TRASHIFY_ALLOW_SAMPLE_ADDRESSES === '1';

  try {
    const apiKey = process.env.RESOLVEGRID_NIPOST_API_KEY;
    const headers = { 'Content-Type': 'application/json', ...(apiKey ? { 'X-Nipost-Key': apiKey } : {}) };
    const options = { headers, cache: 'no-store', redirect: 'error' } as const;
    let suggestion: ResolveGridResponse | undefined;
    if (!isExactCode) {
      const response = await fetch(RESOLVEGRID_API_URL, {
        ...options, method: 'POST', body: JSON.stringify({ query }), signal: AbortSignal.timeout(9000),
      });
      if (response.ok) suggestion = await response.json() as ResolveGridResponse;
    }

    const code = isExactCode ? compact : suggestion?.resolved ? suggestion.primary_match?.postcode : undefined;
    if (code) {
      const lookup = new URL('nipost/lookup', RESOLVEGRID_API_URL);
      const strict = !allowSamples || Boolean(position);
      lookup.search = new URLSearchParams({
        code, level: '3', ...(strict ? { strict: '1' } : {}),
        ...(position ? { lat: String(position.lat), lng: String(position.lng) } : {}),
      }).toString();
      const serviceToken = process.env.RESOLVEGRID_SERVICE_TOKEN?.trim();
      const lookupHeaders = { ...headers, ...(strict && serviceToken ? { 'X-ResolveGrid-Service-Token': serviceToken } : {}) };
      const response = await fetch(lookup, { ...options, headers: lookupHeaders, signal: AbortSignal.timeout(9000) });
      const data = response.ok ? await response.json() as LookupResponse : null;
      const verifiedGeometry = data?.upstream_geometry_verified === true;
      const verifiedPosition = data?.upstream_postcode_verified === true &&
        data.coordinate_origin === 'RESIDENT_DEVICE_REVERSE_MATCH' && Boolean(position);
      const verified = verifiedGeometry || verifiedPosition;
      const match = verified || allowSamples ? data?.data ?? suggestion?.primary_match : undefined;
      const address = match?.recent_house_address;
      const area = match?.administrative_address;
      const lat = match?.coordinates?.latitude;
      const lng = match?.coordinates?.longitude;
      const district = match?.postcode?.toUpperCase().split('-').slice(0, 3).join('-');
      if (match?.postcode && district && /^[A-Z]{2}-\d{2}-[A-Z]\d{2}$/.test(district) && match.postcode.replace(/[ -]/g, '').toUpperCase() === code.replace(/[ -]/g, '').toUpperCase() &&
          address?.recent && area &&
          typeof lat === 'number' && Number.isFinite(lat) && Math.abs(lat) <= 90 &&
          typeof lng === 'number' && Number.isFinite(lng) && Math.abs(lng) <= 180) {
        const source = verified && match.source === 'NIPOST_API_LIVE' ? 'NIPOST_OFFICIAL_API'
          : verified && match.source === 'NIPOST_API_SANDBOX' ? 'NIPOST_SANDBOX' : 'RESOLVEGRID_FIXTURE';
        if (source === 'RESOLVEGRID_FIXTURE' && !allowSamples) return null;
        return {
          rawInput: query, postcode: district, digitalPostcode: match.postcode,
          coordinateOrigin: verifiedPosition ? 'RESIDENT_DEVICE_REVERSE_MATCH' : verifiedGeometry ? 'NIPOST_GEOMETRY' : undefined,
          standardizedAddress: address.recent, area: area.locality_name || '', lga: area.lga_name || '',
          state: area.state_name || '', landmarkMatch: address.landmark_notes,
          confidence: suggestion?.confidence ?? (verified ? 1 : 0),
          source, needsConfirmation: true,
          coordinates: { lat, lng, tierLevel: verifiedGeometry ? 5 : 4 },
        };
      }
    }
  } catch {
    // The booking API fails closed unless explicit sample mode is enabled.
  }

  if (position || !allowSamples || isExactCode) return null;
  const zone = demoZones.find(([, pattern]) => pattern.test(normalized));
  return zone ? { ...NIPOST_PILOT_FIXTURES[zone[0]], rawInput: query } : null;
}
