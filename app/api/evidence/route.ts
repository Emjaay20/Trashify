import { NextRequest, NextResponse } from 'next/server';
import { verifyFieldEvidence } from '@/lib/resolvegrid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, expectedPostcode, submittedCode, correctCode, gpsCoords } = body;

    if (!jobId || !submittedCode) {
      return NextResponse.json({ error: 'jobId and submittedCode are required' }, { status: 400 });
    }

    const verificationResult = verifyFieldEvidence({
      jobId,
      expectedPostcode: expectedPostcode || '900211',
      submittedCode,
      correctCode: correctCode || '4821',
      gpsCoords,
    });

    if (!verificationResult.verified) {
      return NextResponse.json(verificationResult, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      ...verificationResult,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Evidence verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
