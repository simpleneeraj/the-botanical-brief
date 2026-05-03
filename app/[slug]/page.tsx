'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAllArticles, getArticle, setArticles } from '../store';
import { useGreenhouseNews } from '../hooks/use-greenhouse-news';
import { GNewsArticle } from '../types/gnews';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** Strip the truncation notice GNews appends to free-plan content */
function cleanContent(raw: string | null): string {
  if (!raw) return '';
  return raw.replace(/\s*\[\d+ chars\]\s*$/, '').trim();
}

// ─── Fallback: if the store is empty (hard refresh), re-fetch from the hook ──

function useArticleWithFallback(id: string): {
  article: GNewsArticle | null;
  isLoading: boolean;
} {
  const [article, setArticle] = useState<GNewsArticle | null>(
    () => getArticle(id) ?? null,
  );

  // Re-fetch the listing if the store is empty (e.g. user landed directly on
  // the slug URL via hard refresh or shared link)
  const needsFetch = article === null;
  const { articles, isLoading } = useGreenhouseNews({
    max: 20,
    lang: 'en',
    // enabled: needsFetch,
  });

  useEffect(() => {
    if (articles.length > 0) {
      setArticles(articles);
      const found = getArticle(id);
      if (found) setArticle(found);
    }
  }, [articles, id]);

  return { article, isLoading: needsFetch && isLoading };
}

// ─── Related articles sidebar ─────────────────────────────────────────────────

function RelatedCard({ article }: { article: GNewsArticle }) {
  return (
    <Link href={`/${article.id}`} className="related-card">
      <div className="related-img-wrap">
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt={article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="related-img-placeholder" />
        )}
      </div>
      <div className="related-body">
        <span className="source-tag">{article.source.name}</span>
        <p className="related-title">{article.title}</p>
      </div>
    </Link>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.slug) ? params.slug[0] : (params.slug ?? '');

  const { article, isLoading } = useArticleWithFallback(id);

  const related = getAllArticles()
    .filter((a) => a.id !== id)
    .slice(0, 6);

  if (isLoading) {
    return (
      <div className="detail-page">
        <style>{styles}</style>
        <div className="detail-loading">
          <div className="sk-line" style={{ width: '60%', height: 40 }} />
          <div className="sk-line" style={{ width: '40%', height: 16 }} />
          <div className="sk-block" style={{ height: 420 }} />
          <div className="sk-line" style={{ width: '100%', height: 16 }} />
          <div className="sk-line" style={{ width: '90%', height: 16 }} />
          <div className="sk-line" style={{ width: '80%', height: 16 }} />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="detail-page">
        <style>{styles}</style>
        <div className="not-found">
          <h2>Article not found</h2>
          <p>
            It may have expired from the feed. Return to the homepage to reload.
          </p>
          <Link href="/" className="back-btn">
            ← Back to The Botanical Brief
          </Link>
        </div>
      </div>
    );
  }

  const content = cleanContent(article.content);
  const paragraphs = content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="detail-page">
      <style>{styles}</style>

      {/* Top bar */}
      <header className="detail-header">
        <Link href="/" className="back-link">
          ← The Botanical Brief
        </Link>
        <span className="detail-source">{article.source.name}</span>
      </header>

      <div className="detail-layout">
        {/* Article body */}
        <article className="detail-article">
          <div className="detail-meta">
            <span className="source-tag">{article.source.name}</span>
            <span className="date-label">
              {formatDate(article.publishedAt)}
            </span>
          </div>

          <h1 className="detail-title">{article.title}</h1>

          {article.description && (
            <p className="detail-description">{article.description}</p>
          )}

          {article.image && (
            <div className="detail-hero-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.image}
                alt={article.title}
                className="detail-hero-img"
              />
            </div>
          )}

          <div className="detail-content">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p className="detail-no-content">
                Full article content is only available on paid GNews plans. Read
                the full story at{' '}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-source-link"
                >
                  {article.source.name} ↗
                </a>
              </p>
            )}
          </div>

          <div className="detail-footer-row">
            <span className="date-label">
              Originally published on {article.source.name}
            </span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="original-link"
            >
              Read original ↗
            </a>
          </div>
        </article>

        {/* Related sidebar */}
        {related.length > 0 && (
          <aside className="related-sidebar">
            <p className="related-heading">More Stories</p>
            {related.map((a) => (
              <RelatedCard key={a.id} article={a} />
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --cream: #f5f0e8;
    --ink: #1a1a14;
    --moss: #3d5a3e;
    --sage: #7a9e7e;
    --rust: #b85c38;
    --warm-gray: #9e9a91;
    --border: #d8d2c4;
    --card-bg: #faf7f2;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --cream: #161510;
      --ink: #ede8dc;
      --moss: #7ab87e;
      --sage: #4a7a50;
      --rust: #c97050;
      --warm-gray: #7a766d;
      --border: #2e2c27;
      --card-bg: #1e1c17;
    }
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--cream); color: var(--ink); font-family: 'DM Mono', monospace; }
  a { text-decoration: none; color: inherit; }

  .detail-page {
    min-height: 100vh;
    background: var(--cream);
    display: flex;
    flex-direction: column;
  }

  /* ── Top bar ── */
  .detail-header {
    border-bottom: 1px solid var(--border);
    padding: 16px 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  .back-link {
    color: var(--moss);
    transition: opacity 0.2s;
  }
  .back-link:hover { opacity: 0.7; }
  .detail-source { color: var(--warm-gray); }

  /* ── Layout ── */
  .detail-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 48px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 56px 48px;
    width: 100%;
    align-items: start;
  }
  @media (max-width: 860px) {
    .detail-layout { grid-template-columns: 1fr; padding: 32px 24px; gap: 40px; }
    .detail-header { padding: 14px 24px; }
  }

  /* ── Article ── */
  .detail-article { display: flex; flex-direction: column; gap: 24px; }

  .detail-meta {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .source-tag {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--rust);
  }
  .date-label {
    font-size: 10px;
    color: var(--warm-gray);
    letter-spacing: 0.05em;
  }

  .detail-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(28px, 5vw, 52px);
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--ink);
  }

  .detail-description {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-style: italic;
    line-height: 1.55;
    color: var(--warm-gray);
    border-left: 3px solid var(--moss);
    padding-left: 20px;
  }

  .detail-hero-wrap {
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
    background: var(--border);
  }
  .detail-hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .detail-content {
    font-size: 15px;
    line-height: 1.8;
    color: var(--ink);
    display: flex;
    flex-direction: column;
    gap: 18px;
    border-top: 1px solid var(--border);
    padding-top: 28px;
  }
  .detail-no-content {
    color: var(--warm-gray);
    font-size: 13px;
  }
  .detail-source-link {
    color: var(--moss);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .detail-footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 24px;
    border-top: 1px solid var(--border);
    flex-wrap: wrap;
    gap: 12px;
  }
  .original-link {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--moss);
    border: 1px solid var(--moss);
    padding: 8px 16px;
    transition: background 0.2s, color 0.2s;
  }
  .original-link:hover {
    background: var(--moss);
    color: var(--cream);
  }

  /* ── Related sidebar ── */
  .related-sidebar {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid var(--border);
    background: var(--card-bg);
  }
  .related-heading {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--warm-gray);
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
  }
  .related-card {
    display: flex;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.15s;
  }
  .related-card:last-child { border-bottom: none; }
  .related-card:hover { background: color-mix(in srgb, var(--moss) 6%, transparent); }
  .related-img-wrap {
    width: 64px;
    min-width: 64px;
    height: 48px;
    overflow: hidden;
    background: var(--border);
    flex-shrink: 0;
  }
  .related-img-placeholder { width: 100%; height: 100%; background: var(--border); opacity: 0.4; }
  .related-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .related-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--ink);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.2s;
  }
  .related-card:hover .related-title { color: var(--moss); }

  /* ── Loading skeleton ── */
  .detail-loading {
    max-width: 780px;
    margin: 56px auto;
    padding: 0 48px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .sk-line, .sk-block {
    background: var(--border);
    opacity: 0.5;
    animation: pulse 1.4s ease-in-out infinite;
    border-radius: 2px;
    width: 100%;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.35; }
    50%       { opacity: 0.6; }
  }

  /* ── Not found ── */
  .not-found {
    max-width: 480px;
    margin: 120px auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 24px;
  }
  .not-found h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px;
    color: var(--ink);
  }
  .not-found p { font-size: 13px; color: var(--warm-gray); line-height: 1.7; }
  .back-btn {
    display: inline-block;
    margin-top: 8px;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--moss);
    border: 1px solid var(--moss);
    padding: 10px 20px;
    transition: background 0.2s, color 0.2s;
  }
  .back-btn:hover { background: var(--moss); color: var(--cream); }
`;
