import { render } from 'solid-js/web';
import axios from 'axios';
import { findElement } from '@/helpers/automator';
import { loadClientStores } from '@/stores/loadClientStores';
import { IDBManager } from '@/stores/IDBManager';
import MiroToolbar from '@/components/miro/MiroToolbar';
import { throttle } from '@growth-toolkit/common-utils';
import LayersToolbar from '@/components/miro/LayersToolbar';

axios.defaults.withCredentials = true;

async function App() {
  loadClientStores();

  function notifyViewportChange() {
    window.dispatchEvent(new Event('viewportchange'));
  }

  const throttleNotifyViewportChange = throttle(notifyViewportChange, 400);

  function hookViewportChange(event: keyof DocumentEventMap) {
    document.addEventListener(
      event,
      () => {
        throttleNotifyViewportChange();
        setTimeout(() => {
          throttleNotifyViewportChange();
        }, 500);
        setTimeout(() => {
          throttleNotifyViewportChange();
        }, 1000);
        // setTimeout(() => {
        //   throttleNotifyViewportChange();
        // }, 1500);
      },
      true,
    );
  }

  hookViewportChange('click');
  hookViewportChange('auxclick');
  hookViewportChange('wheel');

  const dbManager = new IDBManager('growth-toolkit-db', 2);
  await dbManager.init();

  const observer = new MutationObserver(() => {
    const anchor = findElement('#CREATION_BAR_CONTAINER');
    const rootID = 'growth-toolkit-root';
    if (anchor) {
      const existingRoot = document.getElementById(rootID);
      if (existingRoot) {
        return;
      }
      observer.disconnect();
      render(
        () => (
          <div id={rootID}>
            <MiroToolbar />
            <LayersToolbar />
          </div>
        ),
        document.body,
      );
    }
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  });
}

App();
