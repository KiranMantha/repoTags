import { CategoryDetail } from './CategoryDetail';
import { CategoryList } from './CategoryList';
import { Header } from './Header';
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

function LoadingState() {
  return <div class="app__loading">Loading...</div>;
}
