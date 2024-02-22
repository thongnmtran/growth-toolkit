/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChromeRuntimeTransport } from '@/transports/ChromeRuntimeTransport';
import {
  NewRemoteObjectHelper,
  asSyncTransport,
} from '@growth-toolkit/common-transport';
import { PageTransportServer } from '@/transports/PageTransportServer';

(async () => {
  const backgroundTransport = asSyncTransport(
    new ChromeRuntimeTransport(chrome.runtime.id, 'similarweb'),
  );

  const pageTransportServer = new PageTransportServer();
  pageTransportServer.listen();
  pageTransportServer.addConnectionListener(async (pageTransport) => {
    NewRemoteObjectHelper.linkChannels(
      backgroundTransport,
      pageTransport,
      'similarweb-scraper-client',
    );
  });

  await backgroundTransport.connect();
})();
