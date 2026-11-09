import { NextRequest, NextResponse } from 'next/server';
import { resolveAddressWithResolveGrid } from '@/lib/resolvegrid';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('address') || '';

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const result = await resolveAddressWithResolveGrid(query);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'ResolveGrid query failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
