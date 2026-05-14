import { useRef, useState } from 'preact/hooks';
import { Icon } from './Icon';
import { loadStorage, saveStorage } from './shared/storage';
import { validateSchema } from './shared/types';
import { storageData } from './store';

export function Header() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>();

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleDownload() {
    const data = await loadStorage();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repo-tags-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Reset input so same file can be re-uploaded if needed
    (e.target as HTMLInputElement).value = '';

    const text = await file.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      showToast('Invalid file — could not parse JSON.', 'error');
      return;
    }

    const result = validateSchema(parsed);
    if (!result.valid) {
      showToast(`Invalid data: ${result.error}`, 'error');
      return;
    }

    await saveStorage(result.data);
    storageData.value = result.data;
    showToast(`Imported ${result.data.categories.length} categories and ${result.data.repos.length} repos.`, 'success');
  }

  return (
    <header class="app__header">
      <div class="app__header-logo">
        <Icon name="logo" size={18} color="#fff" />
      </div>
      <h1 class="app__header-title">Repo Tags</h1>

      <div class="app__header-actions">
        <button class="app__header-btn" title="Import data" onClick={handleUploadClick}>
          <Icon name="upload" />
          <span>Import</span>
        </button>
        <button class="app__header-btn" title="Export data" onClick={handleDownload}>
          <Icon name="download" />
          <span>Export</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {toast ? (
        <div class={`app__toast app__toast--${toast.type}`}>
          {toast.type === 'success' ? <Icon name="check" /> : <Icon name="error" />}
          <span>{toast.message}</span>
        </div>
      ) : null}
    </header>
  );
}
