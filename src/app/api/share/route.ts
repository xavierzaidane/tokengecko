import { NextResponse } from 'next/server';
import { createShareToken, getPublicAnalysisByShareToken } from '@/lib/insforge/analyses';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { analysisId, userId } = body;

    if (!analysisId || !userId) {
      return NextResponse.json({ error: 'analysisId and userId are required' }, { status: 400 });
    }

    const { shareToken, error } = await createShareToken(analysisId, userId);
    if (error || !shareToken) {
      return NextResponse.json({ error: error?.message || 'Failed to generate share link' }, { status: 500 });
    }

    return NextResponse.json({ success: true, shareToken });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get('shareToken');

    if (!shareToken) {
      return NextResponse.json({ error: 'shareToken parameter is required' }, { status: 400 });
    }

    const { data, error } = await getPublicAnalysisByShareToken(shareToken);
    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Shared analysis not found' }, { status: 404 });
    }

    return NextResponse.json({ analysis: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
