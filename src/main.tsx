import { render } from 'preact';
import { App } from './App';
import { init } from './store';
import './styles/global.scss';

init().then(() => {
  render(<App />, document.getElementById('app')!);
});
