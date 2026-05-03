import useSWR from 'swr';
import type {
  GNewsArticle,
  UseGNewsOptions,
  UseGNewsReturn,
} from '../types/gnews';
import { gnewsFetcher } from '../api/gnews-fetcher';

/**
 * Builds the internal Route Handler URL that the hook fetches from.
 * The actual GNews API key lives only in the Route Handler (server-side).
 */
function buildInternalUrl(query: string, options: UseGNewsOptions): string {
  const params = new URLSearchParams({ q: query });

  if (options.lang) params.set('lang', options.lang);
  if (options.country) params.set('country', options.country);
  if (options.max) params.set('max', String(options.max));
  if (options.sortBy) params.set('sortby', options.sortBy);
  if (options.page) params.set('page', String(options.page));
  if (options.from) params.set('from', options.from);
  if (options.to) params.set('to', options.to);
  if (options.searchIn?.length) params.set('in', options.searchIn.join(','));
  if (options.nullable?.length)
    params.set('nullable', options.nullable.join(','));

  return `/api?${params.toString()}`;
}

/**
 * `useGNews` — SWR-powered hook for fetching GNews articles.
 *
 * @param query  Search query string (supports GNews boolean operators).
 * @param options Optional filtering / pagination parameters.
 *
 * @example
 * const { articles, isLoading, error } = useGNews(
 *   '"garden centre" OR "greenhouse" OR "botanical building"',
 *   { lang: "en", max: 20, sortBy: "publishedAt" }
 * );
 */
export function useGNews(
  query: string,
  options: UseGNewsOptions = {},
): UseGNewsReturn {
  const { enabled = true, ...fetchOptions } = options;

  // SWR key is null when disabled — prevents any fetch.
  const key =
    enabled && query.trim()
      ? buildInternalUrl(query.trim(), fetchOptions)
      : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    { totalArticles: number; articles: GNewsArticle[] },
    Error
  >(key, gnewsFetcher, {
    // Sensible defaults for a news feed
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60_000, // 1 min — news doesn't change that fast
  });

  return {
    articles: data?.articles ?? [],
    totalArticles: data?.totalArticles ?? 0,
    isLoading,
    isValidating,
    error: error ?? null,
    refresh: () => mutate(),
  };
}
