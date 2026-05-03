import { CategoryDetail } from './CategoryDetail';
import { CategoryList } from './CategoryList';
import { activeCategory, isLoaded } from './store';

export function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '0 24px 48px' }}>
        {isLoaded.value ? activeCategory.value ? <CategoryDetail /> : <CategoryList /> : <LoadingState />}
      </main>
    </div>
  );
}

function Header() {
  return (
    <header
      style={{
        borderBottom: '1px solid #495057',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '1100px',
        width: '100%',
        margin: '0 auto'
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
          <path d="M1 2.75C1 1.784 1.784 1 2.75 1h4.586c.464 0 .909.184 1.237.513l6.5 6.5a1.75 1.75 0 0 1 0 2.474l-4.586 4.586a1.75 1.75 0 0 1-2.474 0l-6.5-6.5A1.752 1.752 0 0 1 1 7.336V2.75zm1.5 0v4.586c0 .1.04.196.11.268l6.5 6.5a.25.25 0 0 0 .354 0l4.586-4.586a.25.25 0 0 0 0-.354l-6.5-6.5A.25.25 0 0 0 7.336 2.5H2.75a.25.25 0 0 0-.25.25zM5 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
        </svg>
      </div>
      <div>
        <h1 style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0', letterSpacing: '-0.01em' }}>
          GitHub Grouper
        </h1>
        <p style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace" }}>your repos, organised</p>
      </div>
    </header>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: '80px 0', textAlign: 'center', color: '#4a5568' }}>
      <div style={{ fontSize: '13px', fontFamily: "'DM Mono', monospace" }}>Loading…</div>
    </div>
  );
}
