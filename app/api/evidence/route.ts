import { NextRequest, NextResponse } from 'next/server';
import { verifyJobEvidence } from '@/lib/db';
import { FieldEvidencePayload } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as FieldEvidencePayload;

    if (!payload.jobId || !payload.customerConfirmationCode) {
      return NextResponse.json(
        { error: 'jobId and customerConfirmationCode are required' },
        { status: 400 }
      );
    }

    const verificationResult = verifyJobEvidence(payload);

    if (!verificationResult.success) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: verificationResult.message,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: verificationResult.message,
      job: verificationResult.job,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Evidence verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
