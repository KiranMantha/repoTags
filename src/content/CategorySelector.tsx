import { useEffect, useRef, useState } from 'preact/hooks';
import { generateId, loadStorage, onStorageChange, setRepoCategories, upsertCategory } from '../shared/storage';
import type { Category, StorageSchema } from '../shared/types';
import { CATEGORY_COLORS } from '../shared/types';

interface Props {
  repoId: string;
  repoName: string;
  url: string;
}

export function CategorySelector({ repoId, repoName, url }: Props) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<StorageSchema>({ categories: [], repos: [] });
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  // Load and keep in sync
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

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = data.categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const canCreate =
    search.trim().length > 0 && !data.categories.some((c) => c.name.toLowerCase() === search.trim().toLowerCase());

  async function toggleCategory(catId: string) {
    const next = selectedIds.includes(catId) ? selectedIds.filter((id) => id !== catId) : [...selectedIds, catId];
    setSelectedIds(next);
    const updated = await setRepoCategories(repoId, repoName, url, next);
    setData(updated);
  }

  async function createCategory() {
    const name = search.trim();
    if (!name) return;
    const color = CATEGORY_COLORS[data.categories.length % CATEGORY_COLORS.length];
    const cat: Category = { id: generateId(), name, color, createdAt: Date.now() };
    const updated = await upsertCategory(cat);
    setData(updated);
    const next = [...selectedIds, cat.id];
    setSelectedIds(next);
    await setRepoCategories(repoId, repoName, url, next);
    setSearch('');
  }

  const selectedCats = data.categories.filter((c) => selectedIds.includes(c.id));

  return (
    <div ref={rootRef} style={{ position: 'relative', fontFamily: 'inherit' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Assign categories"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          border: '1px solid #30363d',
          borderRadius: '6px',
          background: open ? '#21262d' : '#161b22',
          color: '#c9d1d9',
          cursor: 'pointer',
          fontSize: '12px',
          lineHeight: '20px',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s'
        }}
      >
        <TagIcon />
        {selectedCats.length === 0
          ? 'Categories'
          : selectedCats.length === 1
            ? selectedCats[0].name
            : `${selectedCats.length} categories`}
        <ChevronIcon open={open} />
      </button>

      {/* Pill badges */}
      {selectedCats.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '-7px',
            right: '-7px',
            background: '#6366f1',
            borderRadius: '50%',
            width: '14px',
            height: '14px',
            fontSize: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            pointerEvents: 'none'
          }}
        >
          {selectedCats.length}
        </div>
      )}

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 9999,
            width: '240px',
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}
        >
          {/* Search */}
          <div style={{ padding: '8px', borderBottom: '1px solid #21262d' }}>
            <input
              autoFocus
              placeholder="Search or create category…"
              value={search}
              onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canCreate) createCategory();
                if (e.key === 'Escape') setOpen(false);
              }}
              style={{
                width: '100%',
                padding: '5px 8px',
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '5px',
                color: '#c9d1d9',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* List */}
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {filtered.length === 0 && !canCreate && (
              <div style={{ padding: '12px', color: '#8b949e', fontSize: '12px', textAlign: 'center' }}>
                No categories yet
              </div>
            )}

            {filtered.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  background: selectedIds.includes(cat.id) ? '#21262d' : 'transparent',
                  border: 'none',
                  color: '#c9d1d9',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#21262d')}
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = selectedIds.includes(cat.id)
                    ? '#21262d'
                    : 'transparent')
                }
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: cat.color,
                    flexShrink: 0
                  }}
                />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </span>
                {selectedIds.includes(cat.id) && <CheckIcon />}
              </button>
            ))}

            {canCreate && (
              <button
                onClick={createCategory}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderTop: filtered.length > 0 ? '1px solid #21262d' : 'none',
                  color: '#6366f1',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#21262d')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
              >
                <PlusIcon />
                Create &ldquo;{search.trim()}&rdquo;
              </button>
            )}
          </div>

          {/* Selected summary */}
          {selectedCats.length > 0 && (
            <div
              style={{
                padding: '8px 12px',
                borderTop: '1px solid #21262d',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}
            >
              {selectedCats.map((c) => (
                <span
                  key={c.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 7px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    background: c.color + '22',
                    color: c.color,
                    border: `1px solid ${c.color}55`
                  }}
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1 2.75C1 1.784 1.784 1 2.75 1h4.586c.464 0 .909.184 1.237.513l6.5 6.5a1.75 1.75 0 0 1 0 2.474l-4.586 4.586a1.75 1.75 0 0 1-2.474 0l-6.5-6.5A1.752 1.752 0 0 1 1 7.336V2.75zm1.5 0v4.586c0 .1.04.196.11.268l6.5 6.5a.25.25 0 0 0 .354 0l4.586-4.586a.25.25 0 0 0 0-.354l-6.5-6.5A.25.25 0 0 0 7.336 2.5H2.75a.25.25 0 0 0-.25.25zM5 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="currentColor"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
    >
      <path d="M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="#6366f1">
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2z" />
    </svg>
  );
}
