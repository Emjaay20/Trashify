import { NextRequest, NextResponse } from 'next/server';
import { resolveAddressWithResolveGrid } from '@/lib/resolvegrid';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('address') || '';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  try {
    const record = await resolveAddressWithResolveGrid(query);
    return NextResponse.json(record);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown resolution error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
