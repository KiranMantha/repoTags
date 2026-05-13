import { useState } from 'preact/hooks';
import { Icon } from './Icon';
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
      <div class="category-detail__toolbar">
        <button
          class="category-detail__back-btn"
          onClick={() => {
            activeCategory.value = null;
          }}
        >
          <Icon name="back" size={12} />
          All categories
        </button>

        <h2 class="category-detail__heading">{cat.name}</h2>

        <span class="category-detail__badge">
          {repos.length} {repos.length === 1 ? 'repo' : 'repos'}
        </span>
      </div>

      {repos.length > 6 && (
        <div class="category-detail__search">
          <input
            placeholder="Search repos…"
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          />
        </div>
      )}

      {repos.length === 0 ? (
        <div class="category-detail__empty">No repositories available in this category.</div>
      ) : null}

      {search && filtered.length === 0 ? (
        <div class="category-detail__empty">No repos match your search.</div>
      ) : (
        <div class="category-detail__grid">
          {filtered.map((repo) => (
            <RepoCard key={repo.repoId} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}

function RepoCard({ repo }: { repo: RepoEntry }) {
  const [owner, name] = repo.repoId.split('/');

  return (
    <a class="repo-card" href={repo.url} target="_blank" rel="noopener noreferrer">
      <div class="repo-card__inner">
        <Icon name="repo" size={14} color="#dee2e6" />
        <div class="repo-card__meta">
          <div class="repo-card__id">
            {owner}/{name}
          </div>
        </div>
        <Icon name="external-link" size={12} color="#dee2e6" />
      </div>
    </a>
  );
}
