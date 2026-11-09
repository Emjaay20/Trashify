import { NextRequest, NextResponse } from 'next/server';
import { getCollectors, updateCollector } from '@/lib/db';

export async function GET() {
  const collectors = getCollectors();
  return NextResponse.json({
    success: true,
    collectors
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isOnline, capacityUsedPercent } = body;

    if (!id) {
      return NextResponse.json({ error: 'Collector id is required' }, { status: 400 });
    }

    const updated = updateCollector(id, {
      isOnline: typeof isOnline === 'boolean' ? isOnline : undefined,
      capacityUsedPercent: typeof capacityUsedPercent === 'number' ? capacityUsedPercent : undefined
    });

    if (!updated) {
      return NextResponse.json({ error: 'Collector not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, collector: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Collector update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
