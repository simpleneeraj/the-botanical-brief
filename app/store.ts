import { GNewsArticle } from './types/gnews';

/**
 * Module-level Map that persists for the lifetime of the browser session.
 * Articles are written here when the listing page fetches them,
 * then read by the slug detail page — no server round-trip needed.
 */
const articleStore = new Map<string, GNewsArticle>();

export function setArticles(articles: GNewsArticle[]) {
  for (const article of articles) {
    articleStore.set(article.id, article);
  }
}

export function getArticle(id: string): GNewsArticle | undefined {
  return articleStore.get(id);
}

export function getAllArticles(): GNewsArticle[] {
  return Array.from(articleStore.values());
}
