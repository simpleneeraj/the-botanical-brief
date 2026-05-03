import type { GNewsResponse } from '../types/gnews';

/**
 * Builds the GNews search URL.
 * Called server-side (Route Handler) so the API key stays secret.
 */
export function buildGNewsUrl(
  query: string,
  params: Record<string, string | number | undefined>,
): string {
  const base = 'https://gnews.io/api/v4/search';
  const searchParams = new URLSearchParams();

  searchParams.set('q', query);
  searchParams.set('apikey', process.env.GNEWS_API_KEY ?? '');

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  return `${base}?${searchParams.toString()}`;
}

/**
 * Client-side fetcher — hits the Next.js Route Handler (never the GNews API
 * directly) so the API key is never exposed to the browser.
 */
export async function gnewsFetcher(url: string): Promise<GNewsResponse> {
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body?.errors?.[0] ?? `GNews API error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return res.json() as Promise<GNewsResponse>;
}
