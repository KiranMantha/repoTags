export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface RepoEntry {
  /** e.g. "owner/repo-name" */
  repoId: string;
  /** Display label */
  repoName: string;
  /** Full GitHub URL */
  url: string;
  /** Category IDs this repo belongs to */
  categoryIds: string[];
}

export interface StorageSchema {
  categories: Category[];
  repos: RepoEntry[];
}

export const STORAGE_KEY = 'github_grouper_v1';

export const CATEGORY_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#06b6d4'
];
