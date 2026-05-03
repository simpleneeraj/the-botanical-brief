import { useMemo } from 'react';
import { useGNews } from './use-gnews';
import { GNewsArticle } from '../types/gnews';

/**
 * Predefined greenhouse / botanical queries.
 *
 * GNews boolean syntax:
 *  - OR  → match any keyword
 *  - AND → all keywords must appear
 *  - ""  → exact phrase
 */
export const GREENHOUSE_QUERIES = {
  /** Broad sweep — catches all four topics in one request */
  combined:
    '"garden centre" OR "greenhouse" OR "botanical building" OR "building greenhouse" OR "garden center"',

  /** Narrower per-topic queries (use when you want separate feeds) */
  gardenCentre: '"garden centre" OR "garden center"',
  botanicalBuilding: '"botanical building" OR "botanical garden"',
  buildingGreenhouse: '"building greenhouse" OR "greenhouse construction"',
  buildingGardenCentre: '"building garden centre" OR "building garden center"',
} as const;

export type GreenhouseQueryKey = keyof typeof GREENHOUSE_QUERIES;

// ─── Combined hook (single request, all topics) ──────────────────────────────

export interface UseGreenhouseNewsOptions {
  /** Number of articles (max 100 on paid plans). Default: 20 */
  max?: number;
  lang?: string;
  country?: string;
}

export interface UseGreenhouseNewsReturn {
  articles: GNewsArticle[];
  totalArticles: number;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Fetches news for all greenhouse / botanical topics in a single API call.
 *
 * @example
 * const { articles, isLoading } = useGreenhouseNews({ max: 20, lang: "en" });
 */
export function useGreenhouseNews(
  options: UseGreenhouseNewsOptions = {},
): UseGreenhouseNewsReturn {
  return useGNews(GREENHOUSE_QUERIES.combined, {
    lang: options.lang ?? 'en',
    max: options.max ?? 20,
    country: options.country,
    sortBy: 'publishedAt',
  });
}

// ─── Per-topic hook (separate requests, richer data per topic) ───────────────

export interface UseGreenhouseNewsByTopicReturn {
  gardenCentre: UseGreenhouseNewsReturn;
  botanicalBuilding: UseGreenhouseNewsReturn;
  buildingGreenhouse: UseGreenhouseNewsReturn;
  /** De-duplicated union of all articles, sorted newest-first */
  allArticles: GNewsArticle[];
  anyLoading: boolean;
  anyError: Error | null;
}

/**
 * Fetches each topic separately and merges the results.
 * Uses four concurrent SWR requests (all de-duped and cached individually).
 *
 * @example
 * const { allArticles, anyLoading } = useGreenhouseNewsByTopic({ max: 10 });
 */
export function useGreenhouseNewsByTopic(
  options: UseGreenhouseNewsOptions = {},
): UseGreenhouseNewsByTopicReturn {
  const sharedOpts = {
    lang: options.lang ?? 'en',
    max: options.max ?? 10,
    country: options.country,
    sortBy: 'publishedAt' as const,
  };

  const gardenCentre = useGNews(GREENHOUSE_QUERIES.gardenCentre, sharedOpts);
  const botanicalBuilding = useGNews(
    GREENHOUSE_QUERIES.botanicalBuilding,
    sharedOpts,
  );
  const buildingGreenhouse = useGNews(
    GREENHOUSE_QUERIES.buildingGreenhouse,
    sharedOpts,
  );

  // Merge + deduplicate by article id, then sort newest-first
  const allArticles = useMemo(() => {
    const seen = new Set<string>();
    const merged: GNewsArticle[] = [];

    for (const article of [
      ...gardenCentre.articles,
      ...botanicalBuilding.articles,
      ...buildingGreenhouse.articles,
    ]) {
      if (!seen.has(article.id)) {
        seen.add(article.id);
        merged.push(article);
      }
    }

    return merged.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }, [
    gardenCentre.articles,
    botanicalBuilding.articles,
    buildingGreenhouse.articles,
  ]);

  return {
    gardenCentre,
    botanicalBuilding,
    buildingGreenhouse,
    allArticles,
    anyLoading:
      gardenCentre.isLoading ||
      botanicalBuilding.isLoading ||
      buildingGreenhouse.isLoading,
    anyError:
      gardenCentre.error ??
      botanicalBuilding.error ??
      buildingGreenhouse.error ??
      null,
  };
}
