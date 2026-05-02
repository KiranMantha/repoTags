import { useEffect, useRef, useState } from 'preact/hooks';
import type { Category, StorageSchema } from '../shared/types';
import { CATEGORY_COLORS } from '../shared/types';
import { loadStorage, onStorageChange, upsertCategory, setRepoCategories, generateId } from '../shared/storage';

interface Props {
  repoId: string;
  repoName: string;
  url: string;
  description: string;
}

// CSS injected once into the page
const STYLES = `
#github-grouper-root details[role="listbox"] {
  position: relative;
  display: inline-block;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

#github-grouper-root details[role="listbox"] > summary {
  list-style: none;
  position: relative;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 12px;
  height: 28px;
  box-sizing: border-box;
  line-height: 1;
  color: #c9d1d9;
  background: #21262d;
  border: 1px solid rgba(240,246,252,0.1);
  border-radius: 6px;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 500;
}

#github-grouper-root details[role="listbox"] > summary::-webkit-details-marker {
  display: none;
}

#github-grouper-root details[role="listbox"] > summary:hover {
  background: #30363d;
}

#github-grouper-root details[role="listbox"] > summary .gg-badge {
  background: #6366f1;
  border-radius: 10px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  line-height: 16px;
}

#github-grouper-root details[role="listbox"] > summary::after {
  content: '';
  height: 16px;
  width: 16px;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23c9d1d9' d='M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
  transition: transform 0.15s;
}

#github-grouper-root details[role="listbox"][open] > summary {
  background: #30363d;
}

#github-grouper-root details[role="listbox"][open] > summary::before {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
  z-index: 9998;
  display: block;
  cursor: default;
  content: ' ';
  background: transparent;
}

#github-grouper-root details[role="listbox"][open] > summary::after {
  transform: rotate(180deg);
}

#github-grouper-root details[role="listbox"][open] > summary + .gg-dropdown {
  display: block;
}

#github-grouper-root .gg-dropdown {
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

#github-grouper-root .gg-repo-context {
  padding: 8px 12px;
  border-bottom: 1px solid #21262d;
  background: #0d1117;
  font-size: 11px;
}

#github-grouper-root .gg-repo-id {
  color: #8b949e;
  font-family: monospace;
  margin-bottom: 2px;
}

#github-grouper-root .gg-repo-desc {
  color: #6e7681;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#github-grouper-root .gg-search-wrap {
  padding: 8px;
  border-bottom: 1px solid #21262d;
}

#github-grouper-root .gg-search-wrap input[type="search"] {
  width: 100%;
  padding: 5px 8px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 5px;
  color: #c9d1d9;
  font-size: 12px;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
}

#github-grouper-root .gg-options {
  max-height: 220px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
}

#github-grouper-root .gg-options li {
  box-sizing: border-box;
  padding: 0;
  color: #c9d1d9;
}


#github-grouper-root .gg-options li.gg-empty {
  padding: 12px;
  color: #8b949e;
  font-size: 12px;
  text-align: center;
}

#github-grouper-root .gg-options li.hide-item {
  display: none;
}

#github-grouper-root .gg-options li input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

#github-grouper-root .gg-options li input[type="checkbox"]:checked + label {
  border-left-color: #6366f1;
  background: #21262d;
}

#github-grouper-root .gg-options li label {
  cursor: pointer;
  color: #c9d1d9;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  padding: 8px 12px;
  border-left: 3px solid transparent;
  white-space: nowrap;
  font-size: 12px;
}

#github-grouper-root .gg-options li label:hover {
  background: #21262d;
}

#github-grouper-root .gg-options li label .gg-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

#github-grouper-root .gg-options li label .gg-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

#github-grouper-root .gg-create-item {
  border-top: 1px solid #21262d;
}

#github-grouper-root .gg-create-item label {
  color: #6366f1 !important;
}

#github-grouper-root .gg-create-item label:hover {
  background: #21262d !important;
}

#github-grouper-root .gg-selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 12px;
  border-top: 1px solid #21262d;
  list-style: none;
  margin: 0;
}

#github-grouper-root .gg-tag {
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

export function CategorySelector({ repoId, repoName, url, description }: Props) {
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
    const color = CATEGORY_COLORS[data.categories.length % CATEGORY_COLORS.length];
    const cat: Category = { id: generateId(), name, color, createdAt: Date.now() };
    const updated = await upsertCategory(cat);
    setData(updated);
    const next = [...selectedIds, cat.id];
    setSelectedIds(next);
    await setRepoCategories(repoId, repoName, url, description, next);
    setSearch('');
  }

  const selectedCats = data.categories.filter((c) => selectedIds.includes(c.id));

  const summaryLabel =
    selectedCats.length === 0
      ? 'Categorise'
      : selectedCats.length === 1
        ? selectedCats[0].name
        : `${selectedCats.length} categories`;

  return (
    <details role="listbox" ref={detailsRef as any}>
      <summary>
        <TagIcon />
        <span>{summaryLabel}</span>
        {selectedCats.length > 0 && <span class="gg-badge">{selectedCats.length}</span>}
      </summary>

      <ul class="gg-dropdown">
        {/* Repo context */}
        <li class="gg-repo-context">
          <div class="gg-repo-id">{repoId}</div>
          {description && <div class="gg-repo-desc">{description}</div>}
        </li>

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
                <input
                  type="checkbox"
                  id={inputId}
                  name="gg-categories"
                  checked={checked}
                  onChange={() => toggleCategory(cat.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <label
                  for={inputId}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleCategory(cat.id);
                  }}
                >
                  <span class="gg-dot" style={{ background: cat.color }} />
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

        {/* Selected tags */}
        {selectedCats.length > 0 && (
          <ul class="gg-selected-tags">
            {selectedCats.map((c) => (
              <li
                key={c.id}
                class="gg-tag"
                style={{
                  background: c.color + '22',
                  color: c.color,
                  border: `1px solid ${c.color}55`
                }}
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}
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
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2z" />
    </svg>
  );
}
