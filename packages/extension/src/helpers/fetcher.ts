import { ChromeRuntimeTransport } from '@/transports/ChromeRuntimeTransport';
import { Fetcher } from '@/transports/Fetcher';
import {
  NewRemoteObjectHelper,
  asSyncTransport,
} from '@growth-toolkit/common-transport';

export const transport = asSyncTransport(
  new ChromeRuntimeTransport(chrome?.runtime?.id),
);

export let fetcher: Fetcher;

(async () => {
  try {
    await transport.connect();
    fetcher = NewRemoteObjectHelper.wrapClient(
      {} as Fetcher,
      transport,
      'fetcher',
    );
  } catch (err) {
    console.warn('> Fetcher is not available in page context');
  }
})();
