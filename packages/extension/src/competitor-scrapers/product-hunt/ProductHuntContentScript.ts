import { ChromeRuntimeTransport } from '@/transports/ChromeRuntimeTransport';
import { PageTransportServer } from '@/transports/PageTransportServer';
import {
  NewRemoteObjectHelper,
  asSyncTransport,
} from '@growth-toolkit/common-transport';

(async () => {
  const backgroundTransport = asSyncTransport(
    new ChromeRuntimeTransport(chrome.runtime.id, 'producthunt'),
  );

  const pageTransportServer = new PageTransportServer();
  pageTransportServer.listen();
  pageTransportServer.addConnectionListener(async (pageTransport) => {
    NewRemoteObjectHelper.linkChannels(
      backgroundTransport,
      pageTransport,
      'producthunt-scraper',
    );
  });

  await backgroundTransport.connect();
})();
