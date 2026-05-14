import { useEffect } from 'preact/hooks';
import { CategoryDetail } from './CategoryDetail';
import { CategoryList } from './CategoryList';
import { Header } from './Header';
import { Icon } from './Icon';
import { activeCategory, isLoaded, refreshStorage, storageStatus } from './store';

export function App() {
  useEffect(() => {
    refreshStorage();
  }, []);

  return (
    <div class="app">
      <Header />
      <QuotaBar />
      <main class="app__main">
        {isLoaded.value ? activeCategory.value ? <CategoryDetail /> : <CategoryList /> : <LoadingState />}
      </main>
    </div>
  );
}

function QuotaBar() {
  const q = storageStatus.value;
  if (!q) return null;

  const usedKb = (q.used / 1024).toFixed(1);
  const totalKb = (q.total / 1024).toFixed(0);

  const barColor = q.level === 'full' ? '#ef4444' : q.level === 'critical' ? '#f97316' : '#eab308';

  return (
    <div class={`quota-bar quota-bar--${q.level}`}>
      <div class="quota-bar__inner">
        {/* Left: icon + text */}
        <div class="quota-bar__info">
          <Icon name="storage" color={barColor} />
          <div class="quota-bar__text">
            <span class="quota-bar__label">
              {q.level === 'full'
                ? 'Storage full — you cannot add new categories or tag repos.'
                : q.level === 'critical'
                  ? 'Storage almost full. Free up space or export your data.'
                  : 'Storage running low. Consider exporting a backup.'}
            </span>
            <span class="quota-bar__meta">
              {usedKb} KB used of {totalKb} KB
            </span>
          </div>
        </div>

        {/* Right: progress bar + download CTA */}
        <div class="quota-bar__right">
          <div class="quota-bar__track">
            <div
              class="quota-bar__fill"
              style={{
                width: `${Math.min(q.percent, 100)}%`,
                background: barColor
              }}
            />
          </div>
          <span class="quota-bar__percent" style={{ color: barColor }}>
            {q.percent}%
          </span>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return <div class="app__loading">Loading...</div>;
}
