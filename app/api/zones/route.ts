import { NextResponse } from 'next/server';
import { getMunicipalZoneStats } from '@/lib/db';

export async function GET() {
  const zones = getMunicipalZoneStats();
  return NextResponse.json({
    success: true,
    count: zones.length,
    zones
  });
}
