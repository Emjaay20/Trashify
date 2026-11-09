import { CollectorProfile, PickupJob, WasteCategory } from './types';
import { calculateDispatchEstimate } from './resolvegrid';

export interface MatchingScore {
  collector: CollectorProfile;
  score: number;
  matchReasons: string[];
  disqualificationReason?: string;
  distanceKm: number;
}

/**
 * Rules-based collector selection engine.
 * Ensures licensed zone allocation, waste type compliance, capacity constraints, and transparent ETA.
 */
export function rankCollectorsForJob(
  job: PickupJob,
  collectors: CollectorProfile[]
): MatchingScore[] {
  const targetPostcode = job.postcodeRecord.postcode;
  const targetPrefix = targetPostcode.slice(0, 3); // e.g. "900" for Abuja

  return collectors.map((collector) => {
    let score = 100;
    const matchReasons: string[] = [];

    // Rule 1: Zone Match (Primary check)
    const hasExactZone = collector.assignedZones.includes(targetPostcode);
    const hasAreaZone = collector.assignedZones.some(z => z.startsWith(targetPrefix));

    if (hasExactZone) {
      score += 40;
      matchReasons.push(`Assigned directly to Postcode ${targetPostcode}`);
    } else if (hasAreaZone) {
      score += 15;
      matchReasons.push(`Operating in adjacent Abuja sector (${targetPrefix}xxx)`);
    } else {
      return {
        collector,
        score: -1,
        matchReasons: [],
        disqualificationReason: `Not licensed for Postcode ${targetPostcode}`,
        distanceKm: 12.0
      };
    }

    // Rule 2: Waste Category Licensing
    const supportsAllCategories = job.wasteCategories.every(cat => 
      collector.licensedWasteCategories.includes(cat) || collector.licensedWasteCategories.includes('mixed')
    );

    if (!supportsAllCategories) {
      return {
        collector,
        score: -1,
        matchReasons: [],
        disqualificationReason: `Collector truck lacks license for: ${job.wasteCategories.join(', ')}`,
        distanceKm: 8.0
      };
    }
    matchReasons.push(`Licensed for requested waste stream: ${job.wasteCategories.join(', ')}`);

    // Rule 3: Vehicle Capacity Constraint
    const addedLoadPercent = Math.round((job.estimatedWeightKg / 1500) * 100);
    const projectedCapacity = collector.capacityUsedPercent + addedLoadPercent;
    if (projectedCapacity > 98) {
      return {
        collector,
        score: -1,
        matchReasons: [],
        disqualificationReason: `Truck capacity near limit (${collector.capacityUsedPercent}% full)`,
        distanceKm: 4.5
      };
    }
    score += (100 - collector.capacityUsedPercent) * 0.2; // Reward available capacity

    // Rule 4: Collector Rating & Reliability
    score += collector.rating * 5; // e.g., 4.9 * 5 = 24.5 pts
    if (collector.rating >= 4.8) {
      matchReasons.push(`Top-rated operator (${collector.rating}★ rating)`);
    }

    // Calculate synthetic distance based on zone proximity
    const distanceKm = hasExactZone ? 2.4 : 5.8;

    return {
      collector,
      score: Math.round(score),
      matchReasons,
      distanceKm
    };
  })
  .filter(item => !item.disqualificationReason)
  .sort((a, b) => b.score - a.score);
}

/**
 * Automatically assign the optimal collector to a pickup job and calculate dispatch factors.
 */
export function autoAssignCollector(
  job: PickupJob,
  collectors: CollectorProfile[]
): PickupJob {
  const ranked = rankCollectorsForJob(job, collectors);

  if (ranked.length === 0) {
    return job; // Leave unassigned if no matching collector found
  }

  const best = ranked[0];
  const estimate = calculateDispatchEstimate(best.distanceKm, 1, job.id);

  return {
    ...job,
    status: 'collector_matched',
    collector: {
      id: best.collector.id,
      name: best.collector.name,
      phone: best.collector.phone,
      vehicle: best.collector.vehicleType,
      rating: best.collector.rating,
      verifiedPickups: best.collector.completedThisWeek * 7,
      avatarInitials: best.collector.name.charAt(0)
    },
    dispatchEstimate: estimate
  };
}
