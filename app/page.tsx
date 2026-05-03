'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GNewsArticle } from './types/gnews';
import { useGreenhouseNews } from './hooks/use-greenhouse-news';
import { setArticles } from './store';

// ─── Topic tabs ───────────────────────────────────────────────────────────────

const TOPICS = [
  {
    label: 'All',
    query:
      '"garden centre" OR "greenhouse" OR "botanical building" OR "building greenhouse" OR "garden center"',
  },
  { label: 'Garden Centre', query: '"garden centre" OR "garden center"' },
  {
    label: 'Greenhouse',
    query: '"building greenhouse" OR "greenhouse construction"',
  },
  {
    label: 'Botanical',
    query: '"botanical building" OR "botanical garden"',
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

// ─── Article card ─────────────────────────────────────────────────────────────

function ArticleCard({
  article,
  featured = false,
}: {
  article: GNewsArticle;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <Link href={`/${article.id}`} className="featured-card group">
        <div className="featured-image-wrap">
          {article.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.image}
              alt={article.title}
              className="featured-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="featured-img-placeholder" />
          )}
          <div className="featured-overlay" />
        </div>
        <div className="featured-body">
          <span className="source-tag">{article.source.name}</span>
          <h2 className="featured-title">{article.title}</h2>
          <p className="featured-desc">{article.description}</p>
          <span className="date-label">{formatDate(article.publishedAt)}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`//${article.id}`} className="article-card group">
      <div className="article-image-wrap">
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt={article.title}
            className="article-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="article-img-placeholder" />
        )}
      </div>
      <div className="article-body">
        <span className="source-tag">{article.source.name}</span>
        <h3 className="article-title">{article.title}</h3>
        <span className="date-label">{formatDate(article.publishedAt)}</span>
      </div>
    </Link>
  );
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function FeaturedSkeleton() {
  return <div className="featured-card skeleton" style={{ minHeight: 420 }} />;
}

function CardSkeleton() {
  return (
    <div className="article-card skeleton">
      <div className="article-image-wrap skeleton-block" />
      <div className="article-body" style={{ gap: 8 }}>
        <div className="skeleton-line" style={{ width: '40%', height: 12 }} />
        <div className="skeleton-line" style={{ width: '90%', height: 16 }} />
        <div className="skeleton-line" style={{ width: '70%', height: 16 }} />
        <div className="skeleton-line" style={{ width: '30%', height: 12 }} />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);

  const { articles, totalArticles, isLoading, error, refresh } =
    useGreenhouseNews({
      max: 20,
      lang: 'en',
    });

  const featured = articles[0] ?? null;
  const rest = articles.slice(1);

  // Populate the in-memory store so the slug page can look up articles
  useEffect(() => {
    if (articles.length > 0) setArticles(articles);
  }, [articles]);

  return (
    <>
      <style>{`
        /* ── Fonts ─────────────────────────────────────────────────── */
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');

        /* ── Tokens ─────────────────────────────────────────────────── */
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

        /* ── Reset / base ───────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--cream); color: var(--ink); font-family: 'DM Mono', monospace; }
        a { text-decoration: none; color: inherit; }

        /* ── Layout shell ───────────────────────────────────────────── */
        .page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--cream);
        }

        /* ── Masthead ───────────────────────────────────────────────── */
        .masthead {
          border-bottom: 1px solid var(--border);
          padding: 28px 48px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .masthead-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--warm-gray);
        }
        .masthead-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(42px, 6vw, 80px);
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1;
          color: var(--ink);
        }
        .masthead-title em {
          font-style: italic;
          color: var(--moss);
        }
        .masthead-sub {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: var(--warm-gray);
          text-transform: uppercase;
        }

        /* ── Topic bar ──────────────────────────────────────────────── */
        .topic-bar {
          border-bottom: 1px solid var(--border);
          padding: 0 48px;
          display: flex;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .topic-bar::-webkit-scrollbar { display: none; }
        .topic-btn {
          background: none;
          border: none;
          padding: 14px 20px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          color: var(--warm-gray);
          border-bottom: 2px solid transparent;
          transition: color 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .topic-btn:hover { color: var(--ink); }
        .topic-btn.active {
          color: var(--moss);
          border-bottom-color: var(--moss);
        }

        /* ── Content area ───────────────────────────────────────────── */
        .content {
          flex: 1;
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          padding: 48px 48px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 48px;
        }
        @media (max-width: 900px) {
          .content { grid-template-columns: 1fr; padding: 24px; }
          .masthead { padding: 20px 24px 16px; }
          .topic-bar { padding: 0 24px; }
        }

        /* ── Featured card ──────────────────────────────────────────── */
        .featured-card {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border);
          background: var(--card-bg);
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.25s;
        }
        .featured-card:hover { border-color: var(--moss); }
        .featured-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
          background: var(--border);
        }
        .featured-img {
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .featured-card:hover .featured-img { transform: scale(1.03); }
        .featured-img-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, var(--border) 0%, var(--sage) 100%);
          opacity: 0.3;
        }
        .featured-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(26,26,20,0.35) 0%, transparent 60%);
        }
        .featured-body {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .featured-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(22px, 3vw, 34px);
          font-weight: 600;
          line-height: 1.2;
          color: var(--ink);
          transition: color 0.2s;
        }
        .featured-card:hover .featured-title { color: var(--moss); }
        .featured-desc {
          font-size: 13px;
          line-height: 1.65;
          color: var(--warm-gray);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── Sidebar list ───────────────────────────────────────────── */
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 1px solid var(--border);
          background: var(--card-bg);
          align-self: start;
        }
        .sidebar-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sidebar-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--warm-gray);
        }
        .total-badge {
          font-size: 10px;
          color: var(--moss);
          letter-spacing: 0.05em;
        }

        /* ── Article card (sidebar) ─────────────────────────────────── */
        .article-card {
          display: flex;
          gap: 14px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.15s;
        }
        .article-card:last-child { border-bottom: none; }
        .article-card:hover { background: color-mix(in srgb, var(--moss) 6%, transparent); }
        .article-image-wrap {
          position: relative;
          width: 80px;
          min-width: 80px;
          height: 60px;
          background: var(--border);
          overflow: hidden;
          flex-shrink: 0;
        }
        .article-img {
          object-fit: cover;
          transition: transform 0.3s;
        }
        .article-card:hover .article-img { transform: scale(1.05); }
        .article-img-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, var(--border), var(--sage));
          opacity: 0.4;
        }
        .article-body {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }
        .article-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.3;
          color: var(--ink);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s;
        }
        .article-card:hover .article-title { color: var(--moss); }

        /* ── Shared ─────────────────────────────────────────────────── */
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

        /* ── Refresh button ─────────────────────────────────────────── */
        .refresh-btn {
          background: none;
          border: 1px solid var(--border);
          color: var(--warm-gray);
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 6px 12px;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .refresh-btn:hover { border-color: var(--moss); color: var(--moss); }

        /* ── Error ──────────────────────────────────────────────────── */
        .error-box {
          grid-column: 1 / -1;
          padding: 32px;
          border: 1px solid var(--rust);
          color: var(--rust);
          font-size: 12px;
          letter-spacing: 0.05em;
        }

        /* ── Skeleton ───────────────────────────────────────────────── */
        .skeleton { background: var(--card-bg); border: 1px solid var(--border); }
        .skeleton-block { background: var(--border); opacity: 0.5; }
        .skeleton-line {
          background: var(--border);
          opacity: 0.5;
          border-radius: 2px;
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.7; }
        }

        /* ── Footer ─────────────────────────────────────────────────── */
        .footer {
          border-top: 1px solid var(--border);
          padding: 20px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--warm-gray);
        }
        .footer-dot {
          width: 6px; height: 6px;
          background: var(--moss);
          border-radius: 50%;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
      `}</style>

      <div className="page">
        {/* Masthead */}
        <header className="masthead">
          <span className="masthead-eyebrow">
            Curated Industry Intelligence
          </span>
          <h1 className="masthead-title">
            The <em>Botanical</em> Brief
          </h1>
          <span className="masthead-sub">
            Greenhouse · Garden Centre · Botanical Building
          </span>
        </header>

        {/* Topic tabs */}
        <nav className="topic-bar">
          {TOPICS.map((t, i) => (
            <button
              key={t.label}
              className={`topic-btn${activeIndex === i ? ' active' : ''}`}
              onClick={() => setActiveIndex(i)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content grid */}
        <main className="content">
          {error ? (
            <div className="error-box">
              Failed to load articles: {error.message}
            </div>
          ) : isLoading ? (
            <>
              <FeaturedSkeleton />
              <div className="sidebar">
                <div className="sidebar-header">
                  <span className="sidebar-label">Latest</span>
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Featured */}
              <div>
                {featured && <ArticleCard article={featured} featured />}
              </div>

              {/* Sidebar */}
              <aside className="sidebar">
                <div className="sidebar-header">
                  <span className="sidebar-label">Latest</span>
                  <span className="total-badge">
                    {totalArticles.toLocaleString()} stories
                  </span>
                </div>
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </aside>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="footer">
          <span>Powered by GNews API</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="footer-dot" />
            <span>Live feed</span>
          </div>
          <button className="refresh-btn" onClick={refresh}>
            ↻ Refresh
          </button>
        </footer>
      </div>
    </>
  );
}
