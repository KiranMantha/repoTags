import { render, h } from 'preact';
import { CategorySelector } from './CategorySelector';

interface RepoInfo {
  repoId: string;
  repoName: string;
  url: string;
  description: string;
}

const REPO_TAGS_ID = 'repo-tags';

function getRepoInfo(): RepoInfo | null {
  const match = location.pathname.match(/^\/([^/]+)\/([^/]+?)(?:\/.*)?$/);
  if (!match) return null;

  const blocked = ['settings', 'marketplace', 'explore', 'trending', 'notifications', 'issues', 'pulls', 'sponsors'];
  if (blocked.includes(match[1])) return null;

  // Confirm it's actually a repo page
  const isRepoPage = document.querySelector('#repository-details-container');

  if (!isRepoPage) return null;

  const repoId = `${match[1]}/${match[2]}`;
  const repoName = match[2];
  const url = `https://github.com/${repoId}`;

  // Grab description from the About section sidebar
  const description =
    document.querySelector('[data-testid="repo-description"] p')?.textContent?.trim() ??
    document.querySelector('.f4.my-3')?.textContent?.trim() ??
    document.querySelector('p[itemprop="description"]')?.textContent?.trim() ??
    '';

  return { repoId, repoName, url, description };
}

function findInsertionPoint(): Element | null {
  // Star / Unstar button in the top-right action bar
  const repositoryDetailsContainerList = document.querySelector('#repository-details-container > ul');

  return repositoryDetailsContainerList ?? null;
}

function mount() {
  const repo = getRepoInfo();
  if (!repo) return;

  if (document.getElementById(REPO_TAGS_ID)) return;

  const target = findInsertionPoint();
  if (!target) return;

  const listItem = document.createElement('li');
  const wrapper = document.createElement('div');
  wrapper.id = REPO_TAGS_ID;
  wrapper.style.cssText = 'display:inline-flex;align-items:center;align-self:center;vertical-align:middle;';

  listItem.setAttribute('id', `${REPO_TAGS_ID}-root`);
  listItem.append(wrapper);

  target.appendChild(listItem);

  render(
    h(CategorySelector, {
      repoId: repo.repoId,
      repoName: repo.repoName,
      url: repo.url,
      description: repo.description
    }),
    wrapper
  );
}

function unmountAndClean() {
  const el = document.getElementById(REPO_TAGS_ID);
  if (el) {
    render(null, el);
    el.remove();
  }
}

// GitHub is a SPA — re-run on every navigation
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    unmountAndClean();
    setTimeout(mount, 700);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
setTimeout(mount, 0);
