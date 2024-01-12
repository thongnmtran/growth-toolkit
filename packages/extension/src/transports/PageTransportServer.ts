/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseSyncTransportServer,
  asSyncTransport,
} from '@growth-toolkit/common-transport';
import { PageTransport } from './PageTransport';

export class PageTransportServer extends BaseSyncTransportServer<
  PageTransport<any>
> {
  secretKey = 'growth-toolkit';

  override listen(): void {
    window.onmessage = async (event) => {
      if (
        event.data?.type === 'connect' &&
        event.data?.key === this.secretKey
      ) {
        const transport = new PageTransport(this.secretKey);
        await transport.pureConnect();
        const syncTransport = asSyncTransport(transport);
        await syncTransport.connect();
        this.notifyConnection(syncTransport);
      }
    };
  }
}
