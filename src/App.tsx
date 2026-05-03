import { CategoryDetail } from './CategoryDetail';
import { CategoryList } from './CategoryList';
import { Icon } from './Icon';
import { activeCategory, isLoaded } from './store';

export function App() {
  return (
    <div class="app">
      <Header />
      <main class="app__main">
        {isLoaded.value ? activeCategory.value ? <CategoryDetail /> : <CategoryList /> : <LoadingState />}
      </main>
    </div>
  );
}

function Header() {
  return (
    <header class="app__header">
      <div class="app__header-logo">
        <Icon name="logo" size={18} color="white" />
      </div>
      <div>
        <h1 class="app__header-title">Repo Tags</h1>
        <p class="app__header-subtitle">your repos, organised</p>
      </div>
    </header>
  );
}

function LoadingState() {
  return <div class="app__loading">Loading...</div>;
}
