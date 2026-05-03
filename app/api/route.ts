import { buildGNewsUrl } from './gnews-fetcher';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/news
 *
 * Proxies requests to the GNews API.
 * The API key is read from the server-side environment variable GNEWS_API_KEY
 * and is never exposed to the client.
 *
 * Accepted query params (forwarded straight to GNews):
 *   q, lang, country, max, in, nullable, from, to, sortby, page
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = searchParams.get('q');
  if (!query) {
    return NextResponse.json(
      { errors: ['Missing required parameter: q'] },
      { status: 400 },
    );
  }

  if (!process.env.GNEWS_API_KEY) {
    console.error('[GNews] GNEWS_API_KEY is not set.');
    return NextResponse.json(
      { errors: ['Server configuration error: missing API key.'] },
      { status: 500 },
    );
  }

  // Forward allowed params to GNews
  const forwardParams: Record<string, string | number | undefined> = {};
  const allowedParams = [
    'lang',
    'country',
    'max',
    'in',
    'nullable',
    'from',
    'to',
    'sortby',
    'page',
  ] as const;

  for (const param of allowedParams) {
    const value = searchParams.get(param);
    if (value) forwardParams[param] = value;
  }

  const gnewsUrl = buildGNewsUrl(query, forwardParams);

  try {
    const gnewsRes = await fetch(gnewsUrl, {
      // Cache for 5 minutes on the server — adjust to taste
      next: { revalidate: 300 },
    });

    const data = await gnewsRes.json();

    if (!gnewsRes.ok) {
      return NextResponse.json(data, { status: gnewsRes.status });
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        // Allow clients to cache for up to 5 minutes
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    console.error('[GNews] Fetch failed:', err);
    return NextResponse.json(
      { errors: ['Failed to reach GNews API.'] },
      { status: 502 },
    );
  }
}
