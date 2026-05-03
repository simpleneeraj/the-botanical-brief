'use client';

import {
  useGreenhouseNews,
  useGreenhouseNewsByTopic,
} from './hooks/use-greenhouse-news';
import { GNewsArticle } from './types/gnews';

/**
 * Example page — shows both usage patterns:
 *   1. useGreenhouseNews   → single combined request
 *   2. useGreenhouseNewsByTopic → per-topic feeds
 *
 * Replace the placeholder JSX with your actual UI.
 */

// ─── Pattern 1: Single combined feed ─────────────────────────────────────────

export function CombinedNewsFeed() {
  const { articles, totalArticles, isLoading, error, refresh } =
    useGreenhouseNews({ max: 20, lang: 'en' });

  if (isLoading) return <p>Loading news…</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <section>
      <h2>Greenhouse &amp; Botanical News ({totalArticles} total)</h2>
      <button onClick={refresh}>Refresh</button>
      <ul>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </ul>
    </section>
  );
}

// ─── Pattern 2: Per-topic feeds ───────────────────────────────────────────────

export function TopicNewsFeed() {
  const {
    gardenCentre,
    botanicalBuilding,
    buildingGreenhouse,
    anyLoading,
    anyError,
  } = useGreenhouseNewsByTopic({ max: 10, lang: 'en' });

  if (anyLoading) return <p>Loading…</p>;
  if (anyError) return <p>Error: {anyError.message}</p>;

  return (
    <div>
      <TopicSection title="Garden Centre" articles={gardenCentre.articles} />
      <TopicSection
        title="Botanical Buildings"
        articles={botanicalBuilding.articles}
      />
      <TopicSection
        title="Building Greenhouses"
        articles={buildingGreenhouse.articles}
      />
    </div>
  );
}

function TopicSection({
  title,
  articles,
}: {
  title: string;
  articles: GNewsArticle[];
}) {
  return (
    <section>
      <h3>{title}</h3>
      {articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        <ul>
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Shared article card ──────────────────────────────────────────────────────

function ArticleCard({ article }: { article: GNewsArticle }) {
  return (
    <li>
      <a href={article.url} target="_blank" rel="noopener noreferrer">
        <strong>{article.title}</strong>
      </a>
      <p>{article.description}</p>
      <small>
        {article.source.name} ·{' '}
        {new Date(article.publishedAt).toLocaleDateString()}
      </small>
    </li>
  );
}

// ─── Custom query example ─────────────────────────────────────────────────────
// If you need a one-off query, use the low-level hook directly:
//
// import { useGNews } from "@/hooks/use-gnews";
//
// function MyComponent() {
//   const { articles } = useGNews(
//     '"garden enter" OR "greenhouse botanical"',
//     { lang: "en", max: 10, sortBy: "relevance" }
//   );
//   ...
// }
