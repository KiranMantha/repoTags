## Privacy Policy

**Repo Tags — Privacy Policy**
_Last updated: May 2026_

**Overview**
Repo Tags is a Chrome extension that helps you organise GitHub repositories into categories. We are committed to protecting your privacy. This policy explains what data the extension handles and how.

**Data we collect**
Repo Tags stores the following data locally in your browser using `chrome.storage.sync`:

- Category names you create
- Repository names, URLs, and descriptions for repos you have tagged
- The category assignments you make

This data is stored exclusively in Chrome's built-in sync storage, which means it is synced across your own Chrome profile using your Google account's encrypted sync infrastructure. We do not operate any servers, databases, or backend services.

**Data we do not collect**

- We do not collect your name, email address, or any personally identifiable information
- We do not track your browsing activity or which GitHub pages you visit beyond reading the current repo URL to power the dropdown
- We do not use analytics, telemetry, or crash reporting tools
- We do not share any data with third parties

**Permissions used**

- `storage` — to save and sync your categories and repo assignments across devices
- Access to `https://github.com/*` — to inject the Categories dropdown into GitHub repository pages and read the current repo's name and description from the page

**Data retention and deletion**
All data is stored in your Chrome profile. You can delete all data at any time by:

1. Opening the Repo Tags dashboard → Export to save a backup if needed
2. Going to `chrome://extensions` → Repo Tags → clicking the extension's storage options, or simply removing the extension, which deletes all stored data immediately

**Changes to this policy**
If this policy changes in a future version, the updated date at the top will reflect that. Significant changes will be noted in the extension's changelog.

**Contact**
If you have questions about this privacy policy, please open an issue on the GitHub repository for this extension.
