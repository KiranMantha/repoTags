import { computed, signal } from '@preact/signals';
import {
  deleteCategory as deleteStorageCategory,
  loadStorage,
  onStorageChange,
  upsertCategory
} from './shared/storage';
import type { Category, StorageSchema } from './shared/types';

export const storageData = signal<StorageSchema>({ categories: [], repos: [] });
export const activeCategory = signal<Category | null>(null);
export const searchQuery = signal('');
export const isLoaded = signal(false);

export const categories = computed(() => storageData.value.categories);
export const repos = computed(() => storageData.value.repos);

export const filteredCategories = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return categories.value.filter((c) => c.name.toLowerCase().includes(q));
});

export const reposForActiveCategory = computed(() => {
  const cat = activeCategory.value;
  if (!cat) return [];
  return repos.value.filter((r) => r.categoryIds.includes(cat.id));
});

export const categoryRepoCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const repo of repos.value) {
    for (const id of repo.categoryIds) {
      counts[id] = (counts[id] ?? 0) + 1;
    }
  }
  return counts;
});

export async function init() {
  const data = await loadStorage();
  storageData.value = data;
  isLoaded.value = true;
  onStorageChange((d) => {
    storageData.value = d;
  });
}

export async function renameCategory(id: string, name: string) {
  const cat = categories.value.find((c) => c.id === id);
  if (!cat) return;
  const updated = await upsertCategory({ ...cat, name });
  storageData.value = updated;
}

export async function removeCategory(id: string) {
  const updated = await deleteStorageCategory(id);
  storageData.value = updated;
  if (activeCategory.value?.id === id) activeCategory.value = null;
}
