import type { Category, RepoEntry, StorageSchema } from './types';
import { STORAGE_KEY } from './types';

const DEFAULT: StorageSchema = { categories: [], repos: [] };

export type StorageStatus = {
  used: number;
  total: number;
  percent: number;
  level: 'ok' | 'warn' | 'critical' | 'full';
};

export async function getStorageStatus(): Promise<StorageStatus> {
  return new Promise((resolve) => {
    chrome.storage.sync.getBytesInUse(STORAGE_KEY, (used) => {
      const total = chrome.storage.sync.QUOTA_BYTES;
      const percent = Math.round((used / total) * 100);
      const level = percent >= 99 ? 'full' : percent >= 95 ? 'critical' : percent >= 80 ? 'warn' : 'ok';
      resolve({ used, total, percent, level });
    });
  });
}

export async function loadStorage(): Promise<StorageSchema> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      resolve((result[STORAGE_KEY] as StorageSchema) ?? DEFAULT);
    });
  });
}

export async function saveStorage(data: StorageSchema): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: data }, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve();
    });
  });
}

export async function upsertCategory(cat: Category): Promise<StorageSchema> {
  const data = await loadStorage();
  const idx = data.categories.findIndex((c) => c.id === cat.id);
  if (idx >= 0) data.categories[idx] = cat;
  else data.categories.push(cat);
  await saveStorage(data);
  return data;
}

export async function deleteCategory(catId: string): Promise<StorageSchema> {
  const data = await loadStorage();
  data.categories = data.categories.filter((c) => c.id !== catId);
  data.repos = data.repos.map((r) => ({
    ...r,
    categoryIds: r.categoryIds.filter((id) => id !== catId)
  }));
  await saveStorage(data);
  return data;
}

export async function setRepoCategories(
  repoId: string,
  repoName: string,
  url: string,
  description: string,
  categoryIds: string[]
): Promise<StorageSchema> {
  const data = await loadStorage();
  const idx = data.repos.findIndex((r) => r.repoId === repoId);
  const entry: RepoEntry = { repoId, repoName, url, description, categoryIds };
  if (idx >= 0) data.repos[idx] = entry;
  else data.repos.push(entry);
  await saveStorage(data);
  return data;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function onStorageChange(cb: (data: StorageSchema) => void): () => void {
  const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
    if (changes[STORAGE_KEY]) {
      cb((changes[STORAGE_KEY].newValue as StorageSchema) ?? DEFAULT);
    }
  };
  chrome.storage.sync.onChanged.addListener(listener);
  return () => chrome.storage.sync.onChanged.removeListener(listener);
}
