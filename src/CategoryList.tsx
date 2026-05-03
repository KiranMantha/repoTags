import { h } from 'preact';
import { useState } from 'preact/hooks';
import type { Category } from './shared/types';
import {
  activeCategory,
  categoryRepoCounts,
  filteredCategories,
  removeCategory,
  renameCategory,
  searchQuery
} from './store';

export function CategoryList() {
  const cats = filteredCategories.value;
  const counts = categoryRepoCounts.value;

  return (
    <div>
      {/* Stats bar */}
      <div
        style={{
          padding: '32px 0 24px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <h2 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.03em', color: '#e2e8f0', lineHeight: 1 }}>
          {cats.length}
          <span style={{ fontWeight: 400, fontSize: '16px', marginLeft: '10px' }}> categories</span>
        </h2>

        <input
          placeholder="Filter categories…"
          value={searchQuery.value}
          onInput={(e) => {
            searchQuery.value = (e.target as HTMLInputElement).value;
          }}
          style={{
            padding: '8px 14px',
            background: '#343a40',
            border: '1px solid #495057',
            borderRadius: '8px',
            color: '#e2e8f0',
            fontSize: '13px',
            outline: 'none',
            width: '260px',
            fontFamily: "'DM Sans', sans-serif"
          }}
        />
      </div>

      {cats.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '14px'
          }}
        >
          {cats.map((cat) => (
            <CategoryCard key={cat.id} category={cat} count={counts[cat.id] ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryCard({ category, count }: { category: Category; count: number }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(category.name);

  async function save() {
    if (draft.trim() && draft.trim() !== category.name) {
      await renameCategory(category.id, draft.trim());
    }
    setEditing(false);
  }

  return (
    <div
      onClick={() => {
        activeCategory.value = category;
      }}
      style={{
        background: '#343a40',
        border: `1px solid #495057`,
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '16px'
        }}
      >
        {/* Name */}
        {editing ? (
          <input
            autoFocus
            value={draft}
            onInput={(e) => setDraft((e.target as HTMLInputElement).value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') setEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              padding: '4px 6px',
              background: '#0d1117',
              border: `1px solid ${category.color}`,
              borderRadius: '5px',
              color: '#e2e8f0',
              fontSize: '15px',
              fontWeight: 500,
              outline: 'none',
              fontFamily: "'DM Sans', sans-serif"
            }}
          />
        ) : (
          <div
            style={{
              fontSize: '15px',
              fontWeight: 500,
              color: '#e2e8f0',
              letterSpacing: '-0.01em'
            }}
          >
            {category.name}
          </div>
        )}

        <div style={{ display: 'flex', gap: '4px' }}>
          <IconButton
            title="Rename"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
              setDraft(category.name);
            }}
          >
            <PencilIcon />
          </IconButton>
          <IconButton
            title="Delete category"
            danger
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${category.name}"? Repos won't be deleted.`)) {
                removeCategory(category.id);
              }
            }}
          >
            <TrashIcon />
          </IconButton>
        </div>
      </div>

      <div
        onClick={() => {
          activeCategory.value = category;
        }}
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <span
          style={{
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '-0.04em'
          }}
        >
          {count}
        </span>
        <span style={{ fontSize: '11px' }}>{count === 1 ? 'repo' : 'repos'}</span>
      </div>
    </div>
  );
}

function IconButton({
  children,
  title,
  danger,
  onClick
}: {
  children: h.JSX.Element;
  title: string;
  danger?: boolean;
  onClick: (e: MouseEvent) => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '26px',
        height: '26px',
        background: danger ? '#2d1515' : '#1a2030',
        border: `1px solid ${danger ? '#7f1d1d' : '#2d3748'}`,
        borderRadius: '6px',
        cursor: 'pointer',
        color: danger ? '#f87171' : '#94a3b8',
        transition: 'all 0.1s'
      }}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '80px 24px',
        color: '#4a5568'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: '#0f1520',
          border: '1px solid #1a2030',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 16 16" fill="#2d3748">
          <path d="M1 2.75C1 1.784 1.784 1 2.75 1h4.586c.464 0 .909.184 1.237.513l6.5 6.5a1.75 1.75 0 0 1 0 2.474l-4.586 4.586a1.75 1.75 0 0 1-2.474 0l-6.5-6.5A1.752 1.752 0 0 1 1 7.336V2.75zm1.5 0v4.586c0 .1.04.196.11.268l6.5 6.5a.25.25 0 0 0 .354 0l4.586-4.586a.25.25 0 0 0 0-.354l-6.5-6.5A.25.25 0 0 0 7.336 2.5H2.75a.25.25 0 0 0-.25.25zM5 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
        </svg>
      </div>
      <p style={{ fontSize: '14px', fontWeight: 500, color: '#718096', marginBottom: '6px' }}>No categories yet</p>
      <p style={{ fontSize: '12px', fontFamily: "'DM Mono', monospace" }}>
        Visit any GitHub repo and use the Categories dropdown to get started.
      </p>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086zM11.189 6.25 9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.249.249 0 0 0 .108-.064l6.286-6.286z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.149ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
    </svg>
  );
}
