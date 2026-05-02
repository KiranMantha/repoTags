import { h, render } from 'preact';
import { CategorySelector } from './CategorySelector';

function getRepoInfo(): { repoId: string; repoName: string; url: string } | null {
  // Match /<owner>/<repo> paths, excluding special GitHub paths
  const match = location.pathname.match(/^\/([^/]+)\/([^/]+?)(?:\/.*)?$/);
  if (!match) return null;

  const blocked = ['settings', 'marketplace', 'explore', 'trending', 'notifications', 'issues', 'pulls', 'sponsors'];
  if (blocked.includes(match[1])) return null;

  const repoId = `${match[1]}/${match[2]}`;
  const repoName = match[2];
  const url = `https://github.com/${repoId}`;
  return { repoId, repoName, url };
}

function findInsertionPoint(): Element | null {
  // GitHub branch selector container - works on both old and new GitHub UI
  return document.querySelector('#repository-details-container > ul') ?? null;
}

function mount() {
  const repo = getRepoInfo();
  if (!repo) return;

  // Avoid double-mount
  if (document.getElementById('github-grouper-root')) return;

  const target = findInsertionPoint();
  if (!target) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'github-grouper-root';
  wrapper.style.cssText = 'display:inline-flex;align-items:center;margin-left:8px;';
  target.parentElement?.insertBefore(wrapper, target.nextSibling);

  render(
    h(CategorySelector, {
      repoId: repo.repoId,
      repoName: repo.repoName,
      url: repo.url
    }),
    wrapper
  );
}

// GitHub is a SPA – re-run on navigation
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    document.getElementById('github-grouper-root')?.remove();
    setTimeout(mount, 600);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
setTimeout(mount, 800);
