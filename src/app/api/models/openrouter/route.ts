import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache on server for 1 hour

export async function GET() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'HTTP-Referer': 'https://tokengecko.app',
        'X-Title': 'TokenGecko',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `OpenRouter API responded with status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Error fetching OpenRouter models server-side:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch OpenRouter models' },
      { status: 500 }
    );
  }
}
