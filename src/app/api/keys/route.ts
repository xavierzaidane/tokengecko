import { NextResponse } from 'next/server';
import {
  getUserApiKeys,
  saveUserApiKey,
  deleteUserApiKey,
} from '@/lib/insforge/keys';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const { keys, error } = await getUserApiKeys(userId);
    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to fetch keys' }, { status: 500 });
    }

    return NextResponse.json({ keys });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, provider, apiKey } = body;

    if (!userId || !provider || !apiKey) {
      return NextResponse.json(
        { error: 'userId, provider, and apiKey are required' },
        { status: 400 }
      );
    }

    if (!['gemini', 'anthropic'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const { success, maskedKey, error } = await saveUserApiKey(userId, provider, apiKey);
    if (error || !success) {
      return NextResponse.json(
        { error: error?.message || 'Failed to encrypt and store API key' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, maskedKey });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const provider = searchParams.get('provider') as 'gemini' | 'anthropic';

    if (!userId || !provider) {
      return NextResponse.json({ error: 'userId and provider are required' }, { status: 400 });
    }

    const { success, error } = await deleteUserApiKey(userId, provider);
    if (error || !success) {
      return NextResponse.json(
        { error: error?.message || 'Failed to delete API key' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
