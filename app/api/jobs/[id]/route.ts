import { NextRequest, NextResponse } from 'next/server';
import { getJobById, updateJobStatus } from '@/lib/db';
import { JobStatus } from '@/lib/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const job = getJobById(id);

  if (!job) {
    return NextResponse.json({ error: `Job ${id} not found` }, { status: 404 });
  }

  return NextResponse.json({ success: true, job });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, collector, verification, receiptIssued } = body;

    const existing = getJobById(id);
    if (!existing) {
      return NextResponse.json({ error: `Job ${id} not found` }, { status: 404 });
    }

    const updated = updateJobStatus(
      id,
      (status as JobStatus) || existing.status,
      {
        collector: collector || existing.collector,
        verification: verification ? { ...existing.verification, ...verification } : existing.verification,
        receiptIssued: typeof receiptIssued === 'boolean' ? receiptIssued : existing.receiptIssued
      }
    );

    return NextResponse.json({ success: true, job: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
