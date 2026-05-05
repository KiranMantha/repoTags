import { useEffect, useRef, useState } from 'preact/hooks';
import { generateId, loadStorage, onStorageChange, setRepoCategories, upsertCategory } from '../shared/storage';
import type { Category, StorageSchema } from '../shared/types';

type CategorySelectorProps = {
  repoId: string;
  repoName: string;
  url: string;
  description: string;
};

// CSS injected once into the page
const STYLES = `
#repo-tags-root details[role="listbox"] {
  position: relative;
  display: inline-block;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

#repo-tags-root details[role="listbox"] > summary {
  list-style: none;
  position: relative;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 3px 12px;
  height: 28px;
  box-sizing: border-box;
  line-height: 1;
  color: #fff;
  background: oklch(48.8% 0.243 264.376);
  border: 2px solid oklch(48.8% 0.243 264.376);
  border-radius: 6px;
  white-space: nowrap;
  font-weight: 500;
}

#repo-tags-root details[role="listbox"] > summary::-webkit-details-marker {
  display: none;
}

#repo-tags-root details[role="listbox"] > summary .gg-badge {
  background: #2f3742;
  border-radius: 10px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  line-height: 16px;
}

#repo-tags-root details[role="listbox"] > summary::after {
  content: '';
  height: 16px;
  width: 16px;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23fff' d='M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
  transition: transform 0.15s;
}

#repo-tags-root details[role="listbox"][open] > summary::before {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
  z-index: 9998;
  display: block;
  cursor: default;
  content: ' ';
  background: transparent;
}

#repo-tags-root details[role="listbox"][open] > summary::after {
  transform: rotate(180deg);
}

#repo-tags-root details[role="listbox"][open] > summary + .gg-dropdown {
  display: block;
  font-size: 14px;
}

#repo-tags-root .gg-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 260px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  z-index: 9999;
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 4px;
  overflow: hidden;
}

#repo-tags-root .gg-search-wrap {
  padding: 8px;
  border-bottom: 1px solid #21262d;
}

#repo-tags-root .gg-search-wrap input[type="search"] {
  width: 100%;
  padding: 5px 8px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 5px;
  color: #c9d1d9;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
}

#repo-tags-root .gg-options {
  max-height: 220px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
  padding-bottom: 6px;
}

#repo-tags-root .gg-options li {
  box-sizing: border-box;
  padding: 0;
  color: #c9d1d9;
}


#repo-tags-root .gg-options li.gg-empty {
  padding: 12px;
  color: #8b949e;
  text-align: center;
}

#repo-tags-root .gg-options li.hide-item {
  display: none;
}

#repo-tags-root .gg-options li label {
  cursor: pointer;
  color: #c9d1d9;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  padding: 8px 12px;
  border-left: 3px solid transparent;
  white-space: nowrap;
}

#repo-tags-root .gg-options li label:hover {
  background: #21262d;
}

#repo-tags-root .gg-options li label .gg-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

#repo-tags-root .gg-options li label .gg-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

#repo-tags-root .gg-create-item {
  border-top: 1px solid #21262d;
}

#repo-tags-root .gg-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 12px;
  font-size: 10px;
}
`;

let stylesInjected = false;

function injectStyles() {
  if (stylesInjected) return;
  const style = document.createElement('style');
  style.id = 'github-grouper-styles';
  style.textContent = STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

export function CategorySelector({ repoId, repoName, url, description }: CategorySelectorProps) {
  const [data, setData] = useState<StorageSchema>({ categories: [], repos: [] });
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const detailsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    loadStorage().then((d) => {
      setData(d);
      const repo = d.repos.find((r) => r.repoId === repoId);
      setSelectedIds(repo?.categoryIds ?? []);
    });
    return onStorageChange((d) => {
      setData(d);
      const repo = d.repos.find((r) => r.repoId === repoId);
      setSelectedIds(repo?.categoryIds ?? []);
    });
  }, [repoId]);

  const filtered = data.categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const canCreate =
    search.trim().length > 0 && !data.categories.some((c) => c.name.toLowerCase() === search.trim().toLowerCase());

  async function toggleCategory(catId: string) {
    const next = selectedIds.includes(catId) ? selectedIds.filter((id) => id !== catId) : [...selectedIds, catId];
    setSelectedIds(next);
    const updated = await setRepoCategories(repoId, repoName, url, description, next);
    setData(updated);
  }

  async function createAndSelect() {
    const name = search.trim();
    if (!name) return;
    const cat: Category = { id: generateId(), name, createdAt: Date.now() };
    const updated = await upsertCategory(cat);
    setData(updated);
    const next = [...selectedIds, cat.id];
    setSelectedIds(next);
    await setRepoCategories(repoId, repoName, url, description, next);
    setSearch('');
  }

  const selectedCats = data.categories.filter((c) => selectedIds.includes(c.id));

  return (
    <details role="listbox" ref={detailsRef as any}>
      <summary>
        <TagIcon />
        <span>Categories</span>
        <span class="gg-badge">{selectedCats.length}</span>
      </summary>

      <ul class="gg-dropdown">
        {/* Search */}
        <li class="gg-search-wrap">
          <input
            type="search"
            placeholder="Search or create category…"
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canCreate) createAndSelect();
              if (e.key === 'Escape' && detailsRef.current) {
                (detailsRef.current as HTMLDetailsElement).open = false;
              }
            }}
            // Prevent the details from closing when clicking the search input
            onClick={(e) => e.stopPropagation()}
          />
        </li>

        {/* Options */}
        <ul class="gg-options">
          {filtered.length === 0 && !canCreate && <li class="gg-empty">No categories yet</li>}

          {filtered.map((cat) => {
            const checked = selectedIds.includes(cat.id);
            const inputId = `gg-cat-${cat.id}`;
            return (
              <li key={cat.id}>
                <label
                  for={inputId}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleCategory(cat.id);
                  }}
                >
                  <input
                    type="checkbox"
                    id={inputId}
                    name="gg-categories"
                    checked={checked}
                    onChange={() => toggleCategory(cat.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span class="gg-name">{cat.name}</span>
                </label>
              </li>
            );
          })}

          {canCreate && (
            <li class="gg-create-item">
              <label
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  createAndSelect();
                }}
              >
                <PlusIcon />
                <span class="gg-name">Create &ldquo;{search.trim()}&rdquo;</span>
              </label>
            </li>
          )}
        </ul>
      </ul>
    </details>
  );
}

function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M1 2.75C1 1.784 1.784 1 2.75 1h4.586c.464 0 .909.184 1.237.513l6.5 6.5a1.75 1.75 0 0 1 0 2.474l-4.586 4.586a1.75 1.75 0 0 1-2.474 0l-6.5-6.5A1.752 1.752 0 0 1 1 7.336V2.75zm1.5 0v4.586c0 .1.04.196.11.268l6.5 6.5a.25.25 0 0 0 .354 0l4.586-4.586a.25.25 0 0 0 0-.354l-6.5-6.5A.25.25 0 0 0 7.336 2.5H2.75a.25.25 0 0 0-.25.25zM5 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2z" />
    </svg>
  );
}
