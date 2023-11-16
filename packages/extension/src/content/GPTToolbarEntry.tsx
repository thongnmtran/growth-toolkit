import { Portal, render } from 'solid-js/web';
import axios from 'axios';
import GPTToolbar from '../components/GPTToolbar';
import { findElement } from '@/helpers/automator';
import { createSignal, onMount } from 'solid-js';

axios.defaults.withCredentials = true;

function App() {
  const [toolbarAnchor, setToolbarAnchor] = createSignal<HTMLElement>();

  onMount(() => {
    const observer = new MutationObserver(() => {
      const input = findElement('#prompt-textarea');
      if (input) {
        const existingRoot = document.getElementById('gpt-root');
        if (existingRoot) {
          return;
        }
        const root = document.createElement('div');
        root.id = 'gpt-root';
        const parent = input.parentElement!.parentElement!;
        parent.appendChild(root);
        setToolbarAnchor(root);
      }
    });

    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
  });

  return (
    <>
      <Portal mount={toolbarAnchor()}>
        <GPTToolbar />
      </Portal>
    </>
  );
}

render(() => <App />, document);

// const meta = document.createElement('meta');
// meta.setAttribute('http-equiv', 'Content-Security-Policy');
// meta.setAttribute(
//   'content',
//   "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;",
// );
// document.head.appendChild(meta);

// const script = document.createElement('script');
// script.type = 'module';
// script.src = 'http://localhost:3000/src/content/GPTToolbarEntry.tsx';
// document.body.appendChild(script);
