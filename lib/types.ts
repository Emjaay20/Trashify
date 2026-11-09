export type WasteCategory = 'mixed' | 'plastics' | 'paper' | 'metal' | 'e-waste' | 'organic';

export type JobStatus = 
  | 'requested' 
  | 'address_verified' 
  | 'collector_matched' 
  | 'collector_en_route' 
  | 'at_location' 
  | 'verified_completed' 
  | 'paid';

export interface PostcodeRecord {
  postcode: string;
  area: string;
  lga: string;
  state: string;
  formattedAddress: string;
  landmarkMatch?: string;
  confidence: number;
  source: 'NIPOST_DIGITAL_POSTCODE_API' | 'RESOLVEGRID_FIXTURE' | 'LANDMARK_INDEX';
  needsConfirmation: boolean;
  tierLevel: 1 | 2 | 3 | 4 | 5; // Level 5 is point geometry
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DispatchEstimate {
  distanceKm: number;
  etaMinutes: number;
  factors: {
    distance: number;
    trafficMultiplier: number;
    pendingStops: number;
  };
}

export interface FieldEvidencePayload {
  jobId: string;
  collectorId: string;
  postcode: string;
  customerConfirmationCode: string;
  gpsCoords?: {
    lat: number;
    lng: number;
  };
}

export interface PickupJob {
  id: string;
  customerName: string;
  customerPhone: string;
  estateName?: string;
  rawAddressInput: string;
  postcodeRecord: PostcodeRecord;
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
  dispatchEstimate?: DispatchEstimate;
  verification?: {
    gpsVerified: boolean;
    timestamp: string;
    confirmationCode: string;
    photoUrl?: string;
    actualBags: number;
  };
  createdAt: string;
  receiptIssued: boolean;
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
}
