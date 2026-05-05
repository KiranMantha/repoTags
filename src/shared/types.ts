export interface Category {
  id: string;
  name: string;
  createdAt: number;
}

export interface RepoEntry {
  /** e.g. "owner/repo-name" */
  repoId: string;
  /** Display label */
  repoName: string;
  /** Full GitHub URL */
  url: string;
  /** Repo description from About section */
  description: string;
  /** Category IDs this repo belongs to */
  categoryIds: string[];
}

export interface StorageSchema {
  categories: Category[];
  repos: RepoEntry[];
}

export const STORAGE_KEY = 'github_grouper_v1';

export function validateSchema(data: unknown): { valid: true; data: StorageSchema } | { valid: false; error: string } {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { valid: false, error: 'Root must be an object.' };
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.categories)) {
    return { valid: false, error: '"categories" must be an array.' };
  }
  if (!Array.isArray(obj.repos)) {
    return { valid: false, error: '"repos" must be an array.' };
  }

  for (let i = 0; i < obj.categories.length; i++) {
    const category = obj.categories[i] as Record<string, unknown>;
    if (typeof category !== 'object' || category === null)
      return { valid: false, error: `categories[${i}] must be an object.` };
    if (typeof category.id !== 'string' || !category.id)
      return { valid: false, error: `categories[${i}].id must be a non-empty string.` };
    if (typeof category.name !== 'string' || !category.name)
      return { valid: false, error: `categories[${i}].name must be a non-empty string.` };
    if (typeof category.createdAt !== 'number')
      return { valid: false, error: `categories[${i}].createdAt must be a number.` };
  }

  for (let i = 0; i < obj.repos.length; i++) {
    const repo = obj.repos[i] as Record<string, unknown>;
    if (typeof repo !== 'object' || repo === null) return { valid: false, error: `repos[${i}] must be an object.` };
    if (typeof repo.repoId !== 'string' || !repo.repoId)
      return { valid: false, error: `repos[${i}].repoId must be a non-empty string.` };
    if (typeof repo.repoName !== 'string') return { valid: false, error: `repos[${i}].repoName must be a string.` };
    if (typeof repo.url !== 'string') return { valid: false, error: `repos[${i}].url must be a string.` };
    if (typeof repo.description !== 'string')
      return { valid: false, error: `repos[${i}].description must be a string.` };
    if (!Array.isArray(repo.categoryIds) || !repo.categoryIds.every((id) => typeof id === 'string')) {
      return { valid: false, error: `repos[${i}].categoryIds must be an array of strings.` };
    }
  }

  return { valid: true, data: data as StorageSchema };
}
