import { render } from 'solid-js/web';
import axios from 'axios';
import GPTToolbar from '../components/GPTToolbar';

axios.defaults.withCredentials = true;

const input = document.querySelector('#prompt-textarea');
const anchor = input?.parentNode;

if (anchor) {
  const root = document.createElement('div');
  root.id = 'root';
  anchor.parentNode?.appendChild(root);

  const dispose = render(() => <GPTToolbar />, root!);

  if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(dispose);
  }
}
