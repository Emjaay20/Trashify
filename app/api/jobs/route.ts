import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_JOBS } from '@/lib/store';
import { resolveAddressWithResolveGrid, calculateDispatchEstimate } from '@/lib/resolvegrid';
import { PickupJob } from '@/lib/types';

// In-memory jobs list initialized with seed data
let jobsDatabase: PickupJob[] = [...INITIAL_JOBS];

export async function GET() {
  return NextResponse.json({
    success: true,
    count: jobsDatabase.length,
    jobs: jobsDatabase,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, rawAddressInput, wasteCategories, estimatedBags, scheduledDate } = body;

    if (!rawAddressInput) {
      return NextResponse.json({ error: 'Address description or postcode is required' }, { status: 400 });
    }

    // Step 1: Call ResolveGrid to resolve address & NIPOST postcode
    const postcodeRecord = await resolveAddressWithResolveGrid(rawAddressInput);

    // Step 2: Compute pricing and initial dispatch factors
    const bags = Number(estimatedBags) || 4;
    const basePrice = 3000 + (bags - 1) * 500;
    const priceNgn = Math.max(3000, basePrice);
    const recyclableCreditNgn = wasteCategories?.includes('plastics') ? 200 : 0;

    const newJob: PickupJob = {
      id: `TRF-${1045 + jobsDatabase.length}`,
      customerName: customerName || 'New Resident',
      customerPhone: customerPhone || '+234 800 000 0000',
      estateName: 'Sunrise Estate',
      rawAddressInput,
      postcodeRecord,
      wasteCategories: wasteCategories || ['mixed'],
      estimatedBags: bags,
      estimatedWeightKg: bags * 6,
      scheduledDate: scheduledDate || 'Mon 9 Nov',
      pickupWindow: 'Morning window',
      priceNgn,
      recyclableCreditNgn,
      status: 'address_verified',
      dispatchEstimate: calculateDispatchEstimate(3.5, 1),
      verification: {
        gpsVerified: false,
        timestamp: '',
        confirmationCode: Math.floor(1000 + Math.random() * 9000).toString(),
        actualBags: bags,
      },
      createdAt: new Date().toISOString(),
      receiptIssued: false,
    };

    jobsDatabase.unshift(newJob);

    return NextResponse.json({
      success: true,
      message: 'Pickup request created with resolved NIPOST postcode',
      job: newJob,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
