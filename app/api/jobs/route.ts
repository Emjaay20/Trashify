import { NextRequest, NextResponse } from 'next/server';
import { getJobs, createJob } from '@/lib/db';
import { resolveAddressWithResolveGrid } from '@/lib/resolvegrid';
import { JobStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as JobStatus | null;
  const postcode = searchParams.get('postcode') || undefined;
  const collectorId = searchParams.get('collectorId') || undefined;

  const jobs = getJobs({
    status: status || undefined,
    postcode,
    collectorId
  });

  return NextResponse.json({
    success: true,
    count: jobs.length,
    jobs
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      estateName,
      rawAddressInput,
      wasteCategories,
      estimatedBags,
      scheduledDate,
      pickupWindow
    } = body;

    if (!rawAddressInput) {
      return NextResponse.json(
        { error: 'Address description or landmark is required' },
        { status: 400 }
      );
    }

    // Resolve address through ResolveGrid / NIPOST engine
    const postcodeRecord = await resolveAddressWithResolveGrid(rawAddressInput);

    // Compute fair baseline pricing
    const bags = Math.max(1, Number(estimatedBags) || 3);
    const basePrice = 3000 + (bags - 1) * 600;
    const priceNgn = Math.max(3000, basePrice);
    const recyclableCreditNgn = wasteCategories?.some((c: string) => ['plastics', 'paper', 'metal'].includes(c))
      ? 200 * bags
      : 0;

    const newJob = createJob({
      customerName: customerName || 'Abuja Resident',
      customerPhone: customerPhone || '+234 800 123 4567',
      estateName: estateName || 'Urban Estate',
      rawAddressInput,
      postcodeRecord,
      wasteCategories: wasteCategories || ['mixed'],
      estimatedBags: bags,
      scheduledDate: scheduledDate || 'Today, On-Demand',
      pickupWindow: pickupWindow || 'Morning (08:00 - 11:00)',
      priceNgn,
      recyclableCreditNgn
    });

    return NextResponse.json({
      success: true,
      message: 'Waste pickup requested and assigned to licensed zone collector',
      job: newJob
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
