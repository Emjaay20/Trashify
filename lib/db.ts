import { PickupJob, CollectorProfile, MunicipalZoneStats, FieldEvidencePayload, JobStatus } from './types';
import { INITIAL_COLLECTORS, INITIAL_JOBS } from './store';
import { autoAssignCollector } from './matching';
import { verifyFieldEvidence } from './resolvegrid';

// Global singleton in Node environment so state persists across API routes during dev/prod runtime
declare global {
  // eslint-disable-next-line no-var
  var __trashify_jobs__: PickupJob[] | undefined;
  // eslint-disable-next-line no-var
  var __trashify_collectors__: CollectorProfile[] | undefined;
}

if (!global.__trashify_jobs__) {
  global.__trashify_jobs__ = [...INITIAL_JOBS];
}

if (!global.__trashify_collectors__) {
  global.__trashify_collectors__ = [...INITIAL_COLLECTORS];
}

const jobsDb = global.__trashify_jobs__;
const collectorsDb = global.__trashify_collectors__;

export function getJobs(filter?: { status?: JobStatus; postcode?: string; collectorId?: string }): PickupJob[] {
  let list = [...jobsDb];
  if (filter?.status) {
    list = list.filter(j => j.status === filter.status);
  }
  if (filter?.postcode) {
    list = list.filter(j => j.postcodeRecord.postcode === filter.postcode);
  }
  if (filter?.collectorId) {
    list = list.filter(j => j.collector?.id === filter.collectorId);
  }
  return list;
}

export function getJobById(id: string): PickupJob | undefined {
  return jobsDb.find(j => j.id.toLowerCase() === id.toLowerCase());
}

export function createJob(newJobData: Partial<PickupJob>): PickupJob {
  const generatedId = `TRF-${1045 + jobsDb.length}`;
  const now = new Date().toISOString();

  let job: PickupJob = {
    id: generatedId,
    customerName: newJobData.customerName || 'Resident',
    customerPhone: newJobData.customerPhone || '+234 800 000 0000',
    estateName: newJobData.estateName || 'Metropolitan Ward',
    rawAddressInput: newJobData.rawAddressInput || 'Adetokunbo Ademola, Wuse 2',
    postcodeRecord: newJobData.postcodeRecord || {
      rawInput: 'Wuse 2',
      postcode: '900211',
      standardizedAddress: '14 Adetokunbo Ademola Crescent, Wuse 2, AMAC',
      area: 'Wuse 2',
      lga: 'AMAC',
      state: 'FCT — Abuja',
      confidence: 0.88,
      source: 'NIPOST_OFFICIAL_API',
      needsConfirmation: false,
      coordinates: { lat: 9.0765, lng: 7.4812, tierLevel: 4 }
    },
    wasteCategories: newJobData.wasteCategories || ['mixed'],
    estimatedBags: newJobData.estimatedBags || 3,
    estimatedWeightKg: (newJobData.estimatedBags || 3) * 6,
    scheduledDate: newJobData.scheduledDate || 'Today, On-Demand',
    pickupWindow: newJobData.pickupWindow || 'ASAP (Immediate Dispatch)',
    priceNgn: newJobData.priceNgn || 4500,
    recyclableCreditNgn: newJobData.recyclableCreditNgn || 0,
    status: 'requested',
    verification: {
      gpsVerified: false,
      timestamp: '',
      confirmationCode: Math.floor(1000 + Math.random() * 9000).toString(),
      actualBags: newJobData.estimatedBags || 3
    },
    createdAt: now,
    receiptIssued: false
  };

  // Run auto matching
  job = autoAssignCollector(job, collectorsDb);
  jobsDb.unshift(job);
  return job;
}

export function updateJobStatus(
  id: string,
  status: JobStatus,
  extraUpdates?: Partial<PickupJob>
): PickupJob | null {
  const index = jobsDb.findIndex(j => j.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  const current = jobsDb[index];
  const updated: PickupJob = {
    ...current,
    ...extraUpdates,
    status
  };

  jobsDb[index] = updated;
  return updated;
}

export function getCollectors(): CollectorProfile[] {
  return [...collectorsDb];
}

export function getCollectorById(id: string): CollectorProfile | undefined {
  return collectorsDb.find(c => c.id.toLowerCase() === id.toLowerCase());
}

export function updateCollector(id: string, updates: Partial<CollectorProfile>): CollectorProfile | null {
  const index = collectorsDb.findIndex(c => c.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  collectorsDb[index] = {
    ...collectorsDb[index],
    ...updates
  };
  return collectorsDb[index];
}

export function verifyJobEvidence(payload: FieldEvidencePayload): {
  success: boolean;
  message: string;
  job?: PickupJob;
} {
  const job = getJobById(payload.jobId);
  if (!job) {
    return { success: false, message: `Job ${payload.jobId} not found` };
  }

  const result = verifyFieldEvidence({
    ...payload,
    correctCode: job.verification?.confirmationCode || '4821'
  });

  if (!result.verified) {
    return { success: false, message: result.message };
  }

  const updatedJob = updateJobStatus(job.id, 'verified_completed', {
    verification: {
      gpsVerified: true,
      timestamp: result.verifiedAt,
      confirmationCode: job.verification?.confirmationCode || payload.customerConfirmationCode,
      photoUrl: payload.wastePhotoUrl,
      actualBags: job.estimatedBags
    },
    receiptIssued: true
  });

  return {
    success: true,
    message: result.message,
    job: updatedJob || job
  };
}

export function getMunicipalZoneStats(): MunicipalZoneStats[] {
  return [
    {
      postcode: '900211',
      area: 'Wuse 2',
      lga: 'AMAC',
      activeCollectors: 4,
      pickupsToday: 42,
      tonsCollected: 3.8,
      avgConfidence: 0.91,
      slaCompliancePercent: 97.4
    },
    {
      postcode: '900271',
      area: 'Maitama',
      lga: 'AMAC',
      activeCollectors: 3,
      pickupsToday: 36,
      tonsCollected: 4.1,
      avgConfidence: 0.94,
      slaCompliancePercent: 98.2
    },
    {
      postcode: '900001',
      area: 'Garki 1',
      lga: 'AMAC',
      activeCollectors: 2,
      pickupsToday: 29,
      tonsCollected: 2.7,
      avgConfidence: 0.96,
      slaCompliancePercent: 95.0
    },
    {
      postcode: '900231',
      area: 'Asokoro',
      lga: 'AMAC',
      activeCollectors: 2,
      pickupsToday: 18,
      tonsCollected: 1.9,
      avgConfidence: 0.84,
      slaCompliancePercent: 94.1
    },
    {
      postcode: '900108',
      area: 'Jabi',
      lga: 'AMAC',
      activeCollectors: 3,
      pickupsToday: 24,
      tonsCollected: 2.3,
      avgConfidence: 0.89,
      slaCompliancePercent: 96.0
    }
  ];
}
