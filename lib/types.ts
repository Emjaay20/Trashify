export type WasteCategory = 'mixed' | 'plastics' | 'paper' | 'metal' | 'e-waste' | 'organic';

export type JobStatus = 
  | 'requested' 
  | 'address_verified' 
  | 'collector_matched' 
  | 'collector_en_route' 
  | 'at_location' 
  | 'verified_completed' 
  | 'paid';

export interface ResolveGridAddressResult {
  rawInput: string;
  postcode: string;         // Dispatch district, e.g. "FC-02-A09"
  digitalPostcode?: string;  // Building-level alphanumeric code from ResolveGrid
  standardizedAddress: string;
  area: string;
  lga: string;
  state: string;
  landmarkMatch?: string;
  confidence: number;       // 0.0 - 1.0 (e.g. 0.87)
  source: 'NIPOST_OFFICIAL_API' | 'NIPOST_SANDBOX' | 'RESOLVEGRID_FIXTURE' | 'LANDMARK_INDEX';
  needsConfirmation: boolean;
  coordinateOrigin?: 'NIPOST_GEOMETRY' | 'RESIDENT_DEVICE_REVERSE_MATCH';
  coordinates?: {
    lat: number;
    lng: number;
    tierLevel: 1 | 2 | 3 | 4 | 5; // Level 5 = official GPS geometry
  };
}

export interface FieldEvidencePayload {
  jobId: string;
  customerConfirmationCode: string; // 4-digit PIN
  gpsLocation?: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
  };
}

export interface CollectorProfile {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  assignedZones: string[];
  licensedWasteCategories: WasteCategory[];
  vehicleType: string;
  capacityUsedPercent: number;
  rating: number;
  completedThisWeek: number;
  earningsThisWeekNgn: number;
  isOnline?: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
}

export interface PickupJob {
  id: string;
  customerName: string;
  customerPhone: string;
  estateName?: string;
  rawAddressInput: string;
  postcodeRecord: ResolveGridAddressResult;
  wasteCategories: WasteCategory[];
  estimatedBags: number;
  estimatedWeightKg: number;
  scheduledDate: string;
  pickupWindow: string;
  priceNgn: number;
  recyclableCreditNgn: number;
  status: JobStatus;
  collector?: {
    id: string;
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    verifiedPickups: number;
    avatarInitials: string;
  };
  verification?: {
    gpsVerified: boolean;
    timestamp: string;
    confirmationCode?: string;
    photoUrl?: string;
    actualBags: number;
  };
  createdAt: string;
  dueAt?: string;
  startedAt?: string;
  receiptIssued: boolean;
}
