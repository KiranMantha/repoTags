import { render } from 'preact';
import { App } from './App';
import { init } from './store';

init().then(() => {
  render(<App />, document.getElementById('app')!);
});
