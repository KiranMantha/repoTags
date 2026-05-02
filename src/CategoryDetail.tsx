import { useState } from 'preact/hooks';
import type { RepoEntry } from './shared/types';
import { activeCategory, reposForActiveCategory } from './store';

export function CategoryDetail() {
  const cat = activeCategory.value!;
  const repos = reposForActiveCategory.value;
  const [search, setSearch] = useState('');

  const filtered = repos.filter(
    (r) =>
      r.repoName.toLowerCase().includes(search.toLowerCase()) || r.repoId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Back + heading */}
      <div style={{ padding: '28px 0 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            activeCategory.value = null;
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: '#0f1520',
            border: '1px solid #1a2030',
            borderRadius: '8px',
            color: '#718096',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.1s'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.56 7h8.69a.75.75 0 0 1 0 1.5H4.56l3.22 3.22a.75.75 0 0 1 0 1.06z" />
          </svg>
          All categories
        </button>

        {/* Color dot + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: cat.color,
              display: 'inline-block',
              flexShrink: 0
            }}
          />
          <h2 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', color: '#e2e8f0' }}>{cat.name}</h2>
        </div>

        <span
          style={{
            marginLeft: 'auto',
            padding: '3px 10px',
            background: cat.color + '18',
            border: `1px solid ${cat.color}40`,
            borderRadius: '20px',
            color: cat.color,
            fontSize: '11px',
            fontFamily: "'DM Mono', monospace",
            fontWeight: 500
          }}
        >
          {repos.length} {repos.length === 1 ? 'repo' : 'repos'}
        </span>
      </div>

      {/* Search */}
      {repos.length > 6 && (
        <div style={{ marginBottom: '20px' }}>
          <input
            placeholder="Search repos…"
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            style={{
              padding: '8px 14px',
              background: '#0f1520',
              border: '1px solid #1a2030',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '13px',
              outline: 'none',
              width: '260px',
              fontFamily: "'DM Sans', sans-serif"
            }}
          />
        </div>
      )}

      {/* Repo grid */}
      {filtered.length === 0 ? (
        <div style={{ color: '#4a5568', fontSize: '13px', padding: '40px 0', fontFamily: "'DM Mono', monospace" }}>
          No repos match your search.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px'
          }}
        >
          {filtered.map((repo) => (
            <RepoCard key={repo.repoId} repo={repo} accentColor={cat.color} />
          ))}
        </div>
      )}
    </div>
  );
}

function RepoCard({ repo, accentColor }: { repo: RepoEntry; accentColor: string }) {
  const [hovered, setHovered] = useState(false);
  const [owner, name] = repo.repoId.split('/');

  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        padding: '16px 18px',
        background: hovered ? '#0f1520' : '#0b1018',
        border: `1px solid ${hovered ? accentColor + '44' : '#1a2030'}`,
        borderRadius: '10px',
        textDecoration: 'none',
        transition: 'all 0.15s',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: accentColor,
          opacity: hovered ? 1 : 0.3,
          transition: 'opacity 0.15s'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="#4a5568" style={{ flexShrink: 0 }}>
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z" />
        </svg>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '13px', color: '#718096', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>
            {owner}/
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: hovered ? '#e2e8f0' : '#a0aec0',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'color 0.1s'
            }}
          >
            {name}
          </div>
        </div>

        {hovered && (
          <svg
            style={{ marginLeft: 'auto', flexShrink: 0 }}
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill={accentColor}
          >
            <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z" />
          </svg>
        )}
      </div>
    </a>
  );
}
