// ─── GNews API Types ────────────────────────────────────────────────────────

export interface GNewsSource {
  id: string;
  name: string;
  url: string;
  country: string;
}

export interface GNewsArticle {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  lang: string;
  source: GNewsSource;
}

export interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

export interface GNewsError {
  errors: string[];
}

// ─── Hook Options ────────────────────────────────────────────────────────────

export type GNewsSortBy = "publishedAt" | "relevance";
export type GNewsSearchIn = "title" | "description" | "content";

export interface UseGNewsOptions {
  /** ISO 639-1 language code, e.g. "en". Omit for any language. */
  lang?: string;
  /** ISO 3166-1 alpha-2 country code, e.g. "us". Omit for any country. */
  country?: string;
  /** Number of articles to return (1–100, plan-dependent). Default: 10 */
  max?: number;
  /** Fields to search keywords in. Default: ["title", "description"] */
  searchIn?: GNewsSearchIn[];
  /** Fields allowed to be null. */
  nullable?: ("description" | "content" | "image")[];
  /** ISO 8601 date — articles published on or after this date. */
  from?: string;
  /** ISO 8601 date — articles published on or before this date. */
  to?: string;
  /** Sort order. Default: "publishedAt" */
  sortBy?: GNewsSortBy;
  /** Pagination page number (1-based). Default: 1 */
  page?: number;
  /** Whether the hook should fetch. Default: true */
  enabled?: boolean;
}

export interface UseGNewsReturn {
  articles: GNewsArticle[];
  totalArticles: number;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  /** Re-trigger the fetch */
  refresh: () => void;
}
