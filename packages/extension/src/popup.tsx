import { render } from 'solid-js/web';
import GPTToolbar from './components/GPTToolbar';

const dispose = render(() => <GPTToolbar />, document.body);

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(dispose);
}
