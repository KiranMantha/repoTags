import { useState } from 'preact/hooks';
import { JSX } from 'preact/jsx-runtime';
import { Icon } from './Icon';
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
      <div class="category-list__toolbar">
        <h2 class="category-list__heading">
          {cats.length}
          <span class="category-list__heading-sub">{cats.length > 1 ? 'categories' : 'category'}</span>
        </h2>

        <input
          class="category-list__search"
          placeholder="Filter categories…"
          value={searchQuery.value}
          onInput={(e) => {
            searchQuery.value = (e.target as HTMLInputElement).value;
          }}
        />
      </div>
      {cats.length === 0 ? (
        <EmptyState />
      ) : (
        <div class="category-list__grid">
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
      class="category-card"
      onClick={() => {
        activeCategory.value = category;
      }}
    >
      <div class="category-card__header">
        {editing ? (
          <input
            class="category-card__name-input"
            autoFocus
            value={draft}
            onInput={(e) => setDraft((e.target as HTMLInputElement).value)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div class="category-card__name">{category.name}</div>
        )}

        <div class="category-card__actions">
          {editing ? (
            <>
              <IconButton
                title="Save"
                className="save"
                onClick={(e) => {
                  e.stopPropagation();
                  save();
                  setEditing(false);
                  setDraft('');
                }}
              >
                <Icon name="check" size={12} />
              </IconButton>
              <IconButton
                title={editing ? 'Cancel' : 'Rename'}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(false);
                  setDraft('');
                }}
              >
                <Icon name="close" size={12} />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                title="Rename"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                  setDraft(category.name);
                }}
              >
                <Icon name="edit" size={12} />
              </IconButton>
              <IconButton
                title="Delete category"
                className="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${category.name}"? Repos won't be deleted.`)) {
                    removeCategory(category.id);
                  }
                }}
              >
                <Icon name="delete" size={12} />
              </IconButton>
            </>
          )}
        </div>
      </div>

      <div
        class="category-card__count"
        onClick={() => {
          activeCategory.value = category;
        }}
      >
        <span class="category-card__count-number">
          {count}
          <span class="category-card__count-label">{count === 1 ? 'repo' : 'repos'}</span>
        </span>
      </div>
    </div>
  );
}

function IconButton({
  children,
  title,
  className = 'default',
  onClick
}: {
  children: JSX.Element;
  title: string;
  className?: string;
  onClick: (e: MouseEvent) => void;
}) {
  return (
    <button class={`icon-btn icon-btn--${className}`} title={title} onClick={onClick}>
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div class="category-list__empty">
      <div class="category-list__empty-icon">
        <Icon name="logo" size={24} color="#2d3748" />
      </div>
      <p class="category-list__empty-title">No categories yet</p>
      <p class="category-list__empty-hint">Visit any GitHub repo and use the Categories dropdown to get started.</p>
    </div>
  );
}
