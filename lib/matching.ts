import { CollectorProfile, PickupJob } from './types';

export interface MatchingScore {
  collector: CollectorProfile;
  score: number;
  matchReasons: string[];
  disqualificationReason?: string;
}

/**
 * Rules-based collector selection engine.
 * Ensures licensed zone allocation, waste type compliance, capacity constraints.
 */
export function rankCollectorsForJob(
  job: PickupJob,
  collectors: CollectorProfile[]
): MatchingScore[] {
  const targetPostcode = job.postcodeRecord.postcode;
  return collectors.filter((collector) => collector.isOnline && collector.assignedZones.includes(targetPostcode)).map((collector) => {
    let score = 140;
    const matchReasons = [`Assigned to postal zone ${targetPostcode}`];

    // Rule 2: Waste Category Licensing
    const supportsAllCategories = job.wasteCategories.every(cat => 
      collector.licensedWasteCategories.includes(cat)
    );

    if (!supportsAllCategories) {
      return {
        collector,
        score: -1,
        matchReasons: [],
        disqualificationReason: `Collector truck lacks license for: ${job.wasteCategories.join(', ')}`,
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
      };
    }
    score += (100 - collector.capacityUsedPercent) * 0.2; // Reward available capacity

    // Rule 4: Collector Rating & Reliability
    score += collector.rating * 5; // e.g., 4.9 * 5 = 24.5 pts
    if (collector.rating >= 4.8) {
      matchReasons.push(`Top-rated operator (${collector.rating}★ rating)`);
    }

    return {
      collector,
      score: Math.round(score),
      matchReasons
    };
  })
  .filter(item => !item.disqualificationReason)
  .sort((a, b) => b.score - a.score);
}

/**
 * Automatically assign the optimal collector to a pickup job for its approved postal zone.
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
    }
  };
}
